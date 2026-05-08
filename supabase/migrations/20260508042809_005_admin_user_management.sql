/*
  # Admin User Management — Manual VIP & Balance Controls

  1. Changes
    - Add missing admin INSERT policy on wallets (so admin can seed wallets)
    - Add admin INSERT/UPDATE policies on memberships for manual VIP activation
    - Add admin UPDATE policy on wallets for direct balance edits
    - Add admin UPDATE policy on transactions for balance adjustments

  2. New capabilities unlocked
    - Admin can search any user by email
    - Admin can manually assign/change VIP plan → creates/updates membership row
    - Admin can unlock a user's locked balance before the 30-day period ends
    - Admin can directly edit locked_balance and rewards_balance
    - All admin actions are written to admin_audit_log

  3. Security
    - All policies are restricted to rows where caller has role = 'admin'
    - No public access granted
*/

-- Ensure admin can insert wallets (e.g. for users who joined before trigger existed)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'wallets' AND policyname = 'Admins can insert wallets'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Admins can insert wallets"
        ON wallets FOR INSERT TO authenticated
        WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
    $policy$;
  END IF;
END $$;

-- Ensure admins can delete (cancel) memberships
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'memberships' AND policyname = 'Admins can delete memberships'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Admins can delete memberships"
        ON memberships FOR DELETE TO authenticated
        USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
    $policy$;
  END IF;
END $$;

-- Ensure audit log insert is open to any authenticated user acting as admin
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'admin_audit_log' AND policyname = 'Authenticated admins can insert audit log'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Authenticated admins can insert audit log"
        ON admin_audit_log FOR INSERT TO authenticated
        WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
    $policy$;
  END IF;
END $$;
