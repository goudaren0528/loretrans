-- Migration: Encrypt sensitive payment data
-- Step 1: Add a new column to the payments table for encrypted data.
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS encrypted_details BYTEA;

-- Step 2: Update the add_credits_on_purchase function to handle payment logging and encryption.
-- =================================================================
-- Name: add_credits_on_purchase (v3 - with Payment Logging and Encryption)
-- Description: Adds credits, logs the payment with encrypted details, and handles idempotency.
-- Parameters:
--   - p_user_id: UUID of the user.
--   - p_credits_to_add: The integer amount of credits to add.
--   - p_amount_paid_usd: The numeric amount paid by the user.
--   - p_creem_charge_id: The unique identifier for the charge from Creem.
--   - p_payment_metadata: A JSONB object with sensitive details to be encrypted.
-- Returns: JSON object with success status and message.
-- =================================================================
CREATE OR REPLACE FUNCTION public.add_credits_on_purchase(
  p_user_id uuid, 
  p_credits_to_add integer,
  p_amount_paid_usd numeric,
  p_creem_charge_id text,
  p_payment_metadata jsonb
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_balance int;
  key_id uuid;
  nonce bytea;
  encrypted_data bytea;
  new_payment_id bigint;
BEGIN
  -- Idempotency Check
  IF EXISTS (
    SELECT 1
    FROM public.credit_transactions
    WHERE metadata->>'creemChargeId' = p_creem_charge_id
  ) THEN
    RETURN json_build_object('success', true, 'message', 'Event already processed.');
  END IF;

  -- Get the encryption key ID from Vault
  -- This assumes the key is stored with the name 'encryption_key'
  SELECT id INTO key_id FROM pgsodium.valid_key WHERE name = 'encryption_key';
  IF key_id IS NULL THEN
    RAISE EXCEPTION 'Encryption key not found in Vault.';
  END IF;

  -- Encrypt the payment metadata
  nonce := pgsodium.crypto_aead_det_noncegen();
  encrypted_data := pgsodium.crypto_aead_det_encrypt(
    convert_to(p_payment_metadata::text, 'utf8'),
    convert_to(p_creem_charge_id, 'utf8'), -- Using charge ID as associated data
    key_id,
    nonce
  );

  -- Start a transaction to ensure all or nothing
  BEGIN
    -- 1. Add credits to user profile
    UPDATE public.user_profiles
    SET credits = credits + p_credits_to_add
    WHERE id = p_user_id
    RETURNING credits INTO new_balance;

    IF new_balance IS NULL THEN
      RAISE EXCEPTION 'User not found for credit update.';
    END IF;

    -- 2. Insert the payment record with encrypted details
    INSERT INTO public.payments (user_id, creem_payment_id, amount, credits, status, encrypted_details)
    VALUES (p_user_id, p_creem_charge_id, p_amount_paid_usd, p_credits_to_add, 'completed', encrypted_data)
    RETURNING id INTO new_payment_id;

    -- 3. Insert the credit transaction record
    INSERT INTO public.credit_transactions (user_id, amount, type, description, metadata)
    VALUES (
      p_user_id, 
      p_credits_to_add, 
      'purchase', 
      'Purchase of ' || p_credits_to_add || ' credits.', 
      jsonb_build_object(
        'creemChargeId', p_creem_charge_id,
        'paymentId', new_payment_id
      )
    );

  EXCEPTION
    WHEN OTHERS THEN
      RAISE LOG 'Error in transaction for add_credits_on_purchase, user %: %', p_user_id, SQLERRM;
      RETURN json_build_object('success', false, 'message', 'An internal transaction error occurred.');
  END;
  
  RETURN json_build_object('success', true, 'message', 'Credits added and payment logged successfully.', 'new_balance', new_balance);
END;
$$; 