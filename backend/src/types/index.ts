export interface User {
  id: number;
  wallet_address: string;
  referrer_address?: string;
  total_deposited: number;
  total_referral_earned: number;
  available_balance: number;
  referral_balance: number;
  locked_profits: number;
  total_withdrawn: number;
  direct_referrals: number;
  level2_referrals: number;
  level3_referrals: number;
  level4_referrals: number;
  level5_referrals: number;
  has_used_starter: boolean;
  premium_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface Deposit {
  id: number;
  user_id: number;
  wallet_address: string;
  amount: number;
  tx_hash: string;
  block_number?: number;
  status: 'pending' | 'confirmed' | 'failed';
  created_at: Date;
  confirmed_at?: Date;
}

export interface ReferralEarning {
  id: number;
  user_id: number;
  from_user_id: number;
  deposit_id: number;
  level: number;
  percentage: number;
  amount: number;
  created_at: Date;
}

export interface Investment {
  id: number;
  user_id: number;
  amount: number;
  current_value: number;
  yield_earned: number;
  daily_percentage: number;
  yield_goal: number;
  staking_type: 'starter' | 'premium';
  status: 'active' | 'unlocked' | 'withdrawn';
  created_at: Date;
  unlocked_at?: Date;
  withdrawn_at?: Date;
  last_yield_calculated_at: Date;
}

export interface Withdrawal {
  id: number;
  user_id: number;
  wallet_address: string;
  gross_amount: number;
  tax_percentage: number;
  tax_amount: number;
  net_amount: number;
  tx_hash?: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: Date;
  completed_at?: Date;
}

export interface GlobalStats {
  id: number;
  total_deposits: number;
  total_users: number;
  paying_users: number;
  withdrawals_unlocked: boolean;
  unlock_date?: Date;
  last_yield_calculation?: Date;
  cycle_active: boolean;
  cycle_start_date?: Date;
  cycle_number: number;
  cycle_deposits: number;
  cycle_active_wallets: number;
  created_at: Date;
  updated_at: Date;
}

export interface ReferralLevel {
  level: number;
  percentage: number;
}

export const REFERRAL_LEVELS: ReferralLevel[] = [
  { level: 1, percentage: 10 },
  { level: 2, percentage: 5 },
  { level: 3, percentage: 1 },
  { level: 4, percentage: 1 },
  { level: 5, percentage: 1 },
];

export interface StakingTier {
  type: 'starter' | 'premium';
  amount: number;
  dailyPercentage: number;
  yieldGoal: number;
  unlockValue: number;
  estimatedDays: number;
  oneTimeOnly?: boolean;
  premiumLevel?: number;
}

export const STAKING_TIERS: StakingTier[] = [
  {
    type: 'starter',
    amount: 50,
    dailyPercentage: 0.45,
    yieldGoal: 50,
    unlockValue: 100,
    estimatedDays: 154,
    oneTimeOnly: true,
  },
  {
    type: 'premium',
    amount: 100,
    dailyPercentage: 0.7758,
    yieldGoal: 100,
    unlockValue: 200,
    estimatedDays: 90,
    premiumLevel: 1,
  },
  {
    type: 'premium',
    amount: 100,
    dailyPercentage: 0.65,
    yieldGoal: 100,
    unlockValue: 200,
    estimatedDays: 108,
    premiumLevel: 2,
  },
  {
    type: 'premium',
    amount: 100,
    dailyPercentage: 0.55,
    yieldGoal: 100,
    unlockValue: 200,
    estimatedDays: 127,
    premiumLevel: 3,
  },
];
