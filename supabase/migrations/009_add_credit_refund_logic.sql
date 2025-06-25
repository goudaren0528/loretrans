-- =================================================================
-- Name: refund_credits
-- Description: Refunds a specific amount of credits to a user and records the transaction.
-- Parameters:
--   - p_user_id: UUID of the user receiving the refund.
--   - p_amount_to_refund: The integer amount of credits to refund.
-- Returns: JSON object with success status and message.
-- =================================================================
CREATE OR REPLACE FUNCTION public.refund_credits(p_user_id uuid, p_amount_to_refund integer)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance int;
  new_balance int;
BEGIN
  -- Validate that the amount to refund is positive
  IF p_amount_to_refund <= 0 THEN
    RETURN json_build_object('success', false, 'message', 'Refund amount must be positive.');
  END IF;

  -- Add the credits back to the user's profile
  UPDATE public.user_profiles
  SET credits = credits + p_amount_to_refund
  WHERE id = p_user_id
  RETURNING credits INTO new_balance;

  -- If the user was not found, new_balance will be NULL
  IF new_balance IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'User not found.');
  END IF;
  
  -- Record the refund transaction
  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (p_user_id, p_amount_to_refund, 'refund', 'Refund for failed translation.');

  RETURN json_build_object('success', true, 'message', 'Refund successful.', 'new_balance', new_balance);
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in refund_credits for user %: %', p_user_id, SQLERRM;
    RETURN json_build_object('success', false, 'message', 'An unexpected error occurred during the refund process.');
END;
$$; 