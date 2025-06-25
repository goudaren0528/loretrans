-- =================================================================
-- Name: process_refund
-- Description: Processes a refund by deducting credits from a user and updating payment status.
-- Parameters:
--   - p_payment_id: The ID of the payment record to be refunded.
--   - p_creem_refund_id: The unique ID for the refund transaction from Creem.
-- Returns: JSON object with success status and message.
-- =================================================================
CREATE OR REPLACE FUNCTION public.process_refund(
  p_payment_id bigint,
  p_creem_refund_id text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  payment_record public.payments;
  user_profile_record public.user_profiles;
  credits_to_deduct int;
  new_balance int;
BEGIN
  -- 1. Fetch the original payment record
  SELECT * INTO payment_record
  FROM public.payments
  WHERE id = p_payment_id;

  IF payment_record IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Payment not found.');
  END IF;

  -- 2. Check if the payment is already fully refunded
  IF payment_record.status = 'refunded' THEN
    RETURN json_build_object('success', false, 'message', 'Payment has already been fully refunded.');
  END IF;
  
  -- For this simplified version, we assume a full refund.
  -- A more complex version would handle partial refunds and calculate credits proportionally.
  credits_to_deduct := payment_record.credits;

  -- 3. Fetch the user's profile to check their current balance
  SELECT * INTO user_profile_record
  FROM public.user_profiles
  WHERE id = payment_record.user_id;

  IF user_profile_record IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'User profile not found for the payment.');
  END IF;

  -- 4. Start transaction
  BEGIN
    -- Deduct credits from user's profile
    UPDATE public.user_profiles
    SET credits = credits - credits_to_deduct
    WHERE id = payment_record.user_id
    RETURNING credits INTO new_balance;

    -- Update payment status to 'refunded'
    UPDATE public.payments
    SET status = 'refunded'
    WHERE id = p_payment_id;

    -- Insert a 'refund' transaction into the credit log
    INSERT INTO public.credit_transactions (user_id, amount, type, description, metadata)
    VALUES (
      payment_record.user_id,
      -credits_to_deduct, -- Store as a negative value
      'refund',
      'Refund for payment ' || p_payment_id,
      jsonb_build_object(
        'creemRefundId', p_creem_refund_id,
        'originalPaymentId', p_payment_id
      )
    );

  EXCEPTION
    WHEN others THEN
      RAISE LOG 'Error in process_refund for payment %: %', p_payment_id, SQLERRM;
      RETURN json_build_object('success', false, 'message', 'An internal transaction error occurred during refund processing.');
  END;

  RETURN json_build_object('success', true, 'message', 'Refund processed and credits deducted successfully.', 'new_balance', new_balance);
END;
$$; 