/*
  # Add Sham Cash payment method to deposits

  1. Changes
    - Alter deposits payment_method constraint to include 'sham_cash'
    - This allows users to select Sham Cash as a deposit payment method

  2. Important Notes
    1. Uses ALTER TYPE to add the new value to the existing CHECK constraint
    2. No data loss - existing records are unaffected
*/

-- Drop and recreate the check constraint with the new value
ALTER TABLE deposits DROP CONSTRAINT IF EXISTS deposits_payment_method_check;
ALTER TABLE deposits ADD CONSTRAINT deposits_payment_method_check
  CHECK (payment_method IN ('usdt_trc20', 'usdt_bep20', 'paypal', 'stripe', 'sham_cash', 'manual'));
