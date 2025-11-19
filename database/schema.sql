-- WalletPay Database Schema (Educational Purpose)

-- Drop existing tables
DROP TABLE IF EXISTS withdrawals CASCADE;
DROP TABLE IF EXISTS daily_yields CASCADE;
DROP TABLE IF EXISTS referral_earnings CASCADE;
DROP TABLE IF EXISTS deposits CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS global_stats CASCADE;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    referrer_address VARCHAR(42),
    total_deposited DECIMAL(20, 6) DEFAULT 0,
    total_referral_earned DECIMAL(20, 6) DEFAULT 0,
    total_yield_earned DECIMAL(20, 6) DEFAULT 0,
    withdrawable_balance DECIMAL(20, 6) DEFAULT 0,
    direct_referrals INTEGER DEFAULT 0,
    level2_referrals INTEGER DEFAULT 0,
    level3_referrals INTEGER DEFAULT 0,
    level4_referrals INTEGER DEFAULT 0,
    level5_referrals INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_wallet_address CHECK (wallet_address ~* '^0x[a-f0-9]{40}$')
);

-- Deposits table
CREATE TABLE deposits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    wallet_address VARCHAR(42) NOT NULL,
    amount DECIMAL(20, 6) NOT NULL,
    tx_hash VARCHAR(66) UNIQUE NOT NULL,
    block_number BIGINT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, failed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Referral earnings table
CREATE TABLE referral_earnings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    from_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    deposit_id INTEGER REFERENCES deposits(id) ON DELETE CASCADE,
    level INTEGER NOT NULL,
    percentage DECIMAL(5, 2) NOT NULL,
    amount DECIMAL(20, 6) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_level CHECK (level BETWEEN 1 AND 5),
    CONSTRAINT valid_percentage CHECK (percentage > 0)
);

-- Daily yields table
CREATE TABLE daily_yields (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(20, 6) NOT NULL,
    global_balance DECIMAL(20, 6) NOT NULL,
    yield_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT positive_yield CHECK (amount >= 0),
    UNIQUE(user_id, yield_date)
);

-- Withdrawals table
CREATE TABLE withdrawals (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(42) NOT NULL,
    amount DECIMAL(20, 6) NOT NULL,
    type VARCHAR(20) DEFAULT 'regular', -- regular, referral, yield
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed
    tx_hash VARCHAR(66),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    CONSTRAINT positive_withdrawal_amount CHECK (amount > 0)
);

-- Global stats table
CREATE TABLE global_stats (
    id SERIAL PRIMARY KEY,
    total_deposits DECIMAL(20, 6) DEFAULT 0,
    total_users INTEGER DEFAULT 0,
    paying_users INTEGER DEFAULT 0,
    withdrawals_unlocked BOOLEAN DEFAULT FALSE,
    unlock_date TIMESTAMP,
    last_yield_calculation TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initialize global stats
INSERT INTO global_stats (total_deposits, total_users, paying_users, withdrawals_unlocked)
VALUES (0, 0, 0, FALSE);

-- Indexes for performance
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_referrer ON users(referrer_address);
CREATE INDEX idx_deposits_user ON deposits(user_id);
CREATE INDEX idx_deposits_status ON deposits(status);
CREATE INDEX idx_deposits_tx_hash ON deposits(tx_hash);
CREATE INDEX idx_referral_earnings_user ON referral_earnings(user_id);
CREATE INDEX idx_daily_yields_user ON daily_yields(user_id);
CREATE INDEX idx_daily_yields_date ON daily_yields(yield_date);
CREATE INDEX idx_withdrawals_wallet ON withdrawals(wallet_address);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
CREATE INDEX idx_withdrawals_type ON withdrawals(type);

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_global_stats_updated_at BEFORE UPDATE ON global_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
