export interface Profile {
  id: string;
  username: string;
  phone: string | null;
  role: 'user' | 'admin';
  is_active: boolean;
  is_banned: boolean;
  referral_code: string;
  referred_by: string | null;
  ip_address: string | null;
  device_info: string | null;
  email: string;
  last_login_ip: string | null;
  last_login_at: string | null;
  ban_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface VipPlan {
  id: string;
  name: string;
  price: number;
  lock_duration_days: number;
  daily_attempts: number;
  daily_reward_cap: number;
  reward_per_game: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Membership {
  id: string;
  user_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  locked_amount: number;
  is_unlocked: boolean;
  status: 'active' | 'expired' | 'cancelled';
  daily_attempts_used: number;
  daily_rewards_earned: number;
  last_reset_date: string;
  created_at: string;
  plan?: VipPlan;
}

export interface Wallet {
  id: string;
  user_id: string;
  locked_balance: number;
  rewards_balance: number;
  available_balance: number;
  total_deposited: number;
  total_withdrawn: number;
  total_rewards_earned: number;
  updated_at: string;
}

export interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  payment_method: 'sham_cash';
  wallet_address: string | null;
  proof_image_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_note: string | null;
  plan_id: string | null;
  ip_address: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  balance_type: 'rewards' | 'available';
  payment_method: 'usdt_trc20' | 'usdt_bep20' | 'paypal' | 'bank_transfer';
  payment_details: string | null;
  status: 'pending' | 'paid' | 'rejected';
  admin_note: string | null;
  ip_address: string | null;
  device_info: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export interface GameSession {
  id: string;
  user_id: string;
  membership_id: string;
  level_played: number;
  reward_earned: number;
  ad_watched: boolean;
  ip_address: string | null;
  device_info: string | null;
  ad_duration_seconds: number;
  created_at: string;
}

export interface Reward {
  id: string;
  user_id: string;
  game_session_id: string | null;
  amount: number;
  reward_type: 'game' | 'ad' | 'referral' | 'bonus';
  description: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal' | 'reward' | 'referral' | 'unlock' | 'adjustment';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  reference_id: string | null;
  reference_type: string | null;
  description: string | null;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  reward_amount: number;
  is_paid: boolean;
  created_at: string;
  paid_at: string | null;
}

export interface AdminSetting {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}
