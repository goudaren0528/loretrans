-- =================================================================
-- Name: add_credits_on_purchase (v2 - with Idempotency)
-- Description: Adds credits to a user's account after a successful purchase and records the transaction.
--              Includes an idempotency check to prevent duplicate processing of the same charge.
-- Parameters:
--   - p_user_id: UUID of the user.
--   - p_credits_to_add: The integer amount of credits to add.
--   - p_creem_charge_id: The unique identifier for the charge from Creem.
-- Returns: JSON object with success status and message.
-- =================================================================
CREATE OR REPLACE FUNCTION public.add_credits_on_purchase(
  p_user_id uuid, 
  p_credits_to_add integer,
  p_creem_charge_id text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_balance int;
  existing_transaction_id bigint;
BEGIN
  -- Idempotency Check: See if this charge has already been processed.
  SELECT id INTO existing_transaction_id
  FROM public.credit_transactions
  WHERE metadata->>'creemChargeId' = p_creem_charge_id
  LIMIT 1;

  IF existing_transaction_id IS NOT NULL THEN
    -- This charge has already been processed. Return success without doing anything.
    RETURN json_build_object('success', true, 'message', 'Event already processed.');
  END IF;

  -- Ensure the number of credits is positive
  IF p_credits_to_add <= 0 THEN
    RETURN json_build_object('success', false, 'message', 'Credits to add must be positive.');
  END IF;

  -- Update user's credit balance
  UPDATE public.user_profiles
  SET credits = credits + p_credits_to_add
  WHERE id = p_user_id
  RETURNING credits INTO new_balance;

  -- Check if user was found
  IF new_balance IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'User not found.');
  END IF;

  -- Record the purchase transaction
  INSERT INTO public.credit_transactions (user_id, amount, type, description, metadata)
  VALUES (p_user_id, p_credits_to_add, 'purchase', 'Purchase of ' || p_credits_to_add || ' credits.', jsonb_build_object('creemChargeId', p_creem_charge_id));

  RETURN json_build_object('success', true, 'message', 'Credits added successfully.', 'new_balance', new_balance);
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in add_credits_on_purchase for user %: %', p_user_id, SQLERRM;
    RETURN json_build_object('success', false, 'message', 'An unexpected error occurred during credit addition.');
END;
$$;