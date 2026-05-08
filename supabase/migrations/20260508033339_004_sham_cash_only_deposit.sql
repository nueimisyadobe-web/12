/*
  # Set Sham Cash as the only deposit payment method

  1. Changes
    - Alter deposits payment_method constraint to only allow 'sham_cash'
    - This enforces that Sham Cash is the sole deposit method

  2. Important Notes
    1. Existing deposits with other methods are preserved
    2. New deposits can only use 'sham_cash'
*/

ALTER TABLE deposits DROP CONSTRAINT IF EXISTS deposits_payment_method_check;
ALTER TABLE deposits ADD CONSTRAINT deposits_payment_method_check
  CHECK (payment_method IN ('sham_cash'));
