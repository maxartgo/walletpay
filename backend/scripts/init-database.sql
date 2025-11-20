-- WalletStake Database Schema
-- This script creates all necessary tables for the application

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  referrer_address VARCHAR(42),
  total_deposited DECIMAL(20, 6) DEFAULT 0,
  total_referral_earned DECIMAL(20, 6) DEFAULT 0,
  available_balance DECIMAL(20, 6) DEFAULT 0,
  referral_balance DECIMAL(20, 6) DEFAULT 0,
  locked_profits DECIMAL(20, 6) DEFAULT 0,
  total_withdrawn DECIMAL(20, 6) DEFAULT 0,
  direct_referrals INTEGER DEFAULT 0,
  level2_referrals INTEGER DEFAULT 0,
  level3_referrals INTEGER DEFAULT 0,
  level4_referrals INTEGER DEFAULT 0,
  level5_referrals INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Investments table
CREATE TABLE IF NOT EXISTS investments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(20, 6) NOT NULL,
  current_value DECIMAL(20, 6) NOT NULL,
  yield_earned DECIMAL(20, 6) DEFAULT 0,
  daily_percentage DECIMAL(10, 4) NOT NULL,
  yield_goal DECIMAL(20, 6) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'unlocked', 'withdrawn')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  unlocked_at TIMESTAMP,
  withdrawn_at TIMESTAMP,
  last_yield_calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deposits table
CREATE TABLE IF NOT EXISTS deposits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(20, 6) NOT NULL,
  tx_hash VARCHAR(66) NOT NULL UNIQUE,
  referrer_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Referral earnings table
CREATE TABLE IF NOT EXISTS referral_earnings (
  id SERIAL PRIMARY KEY,
  referrer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
  amount DECIMAL(20, 6) NOT NULL,
  deposit_id INTEGER NOT NULL REFERENCES deposits(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gross_amount DECIMAL(20, 6) NOT NULL,
  tax_amount DECIMAL(20, 6) NOT NULL,
  net_amount DECIMAL(20, 6) NOT NULL,
  withdrawal_type VARCHAR(20) NOT NULL CHECK (withdrawal_type IN ('personal', 'referral')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'rejected')),
  tx_hash VARCHAR(66),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_referrer ON users(referrer_address);
CREATE INDEX IF NOT EXISTS idx_investments_user ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status);
CREATE INDEX IF NOT EXISTS idx_deposits_user ON deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_tx ON deposits(tx_hash);
CREATE INDEX IF NOT EXISTS idx_referral_earnings_referrer ON referral_earnings(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_earnings_referee ON referral_earnings(referee_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);

-- Insert admin wallet (from environment variable)
INSERT INTO admins (wallet_address)
VALUES ('0x1aaccd0ea502d89443d7a70ce68fcff49200292e')
ON CONFLICT (wallet_address) DO NOTHING;

-- Display success message
SELECT 'Database initialized successfully!' AS message;
