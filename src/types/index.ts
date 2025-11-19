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
  created_at: string;
  updated_at: string;
}

export interface GlobalStats {
  total_deposits: number;
  total_users: number;
  paying_users: number;
  withdrawals_unlocked: boolean;
  unlock_date?: string;
  last_yield_calculation?: string;
  goals: {
    depositGoal: number;
    userGoal: number;
    depositProgress: number;
    userProgress: number;
  };
  yieldPercentage: number;
}

export interface Deposit {
  id: number;
  user_id: number;
  wallet_address: string;
  amount: number;
  tx_hash: string;
  block_number?: number;
  status: 'pending' | 'confirmed' | 'failed';
  created_at: string;
  confirmed_at?: string;
}

export interface ReferralEarning {
  id: number;
  user_id: number;
  from_user_id: number;
  deposit_id: number;
  level: number;
  percentage: number;
  amount: number;
  created_at: string;
  from_wallet?: string;
  deposit_amount?: number;
}

export interface DailyYield {
  id: number;
  user_id: number;
  amount: number;
  global_balance: number;
  yield_date: string;
  created_at: string;
}

export interface Investment {
  id: number;
  user_id: number;
  amount: number;
  current_value: number;
  yield_earned: number;
  daily_percentage: number;
  yield_goal: number;
  status: 'active' | 'unlocked' | 'withdrawn';
  created_at: string;
  unlocked_at?: string;
  withdrawn_at?: string;
  last_yield_calculated_at: string;
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
  created_at: string;
  completed_at?: string;
}

export interface WalletState {
  address: string | null;
  balance: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
}
