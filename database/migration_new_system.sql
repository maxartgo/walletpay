-- ==========================================
-- WalletPay - New Investment System Migration
-- ==========================================
-- This migration updates the database schema for the new investment system:
-- - 100 USDT fixed investments
-- - 1% daily compound yield
-- - 100 USDT yield goal (200 USDT total)
-- - 20% withdrawal tax
-- ==========================================

-- Drop old tables that are no longer needed
DROP TABLE IF EXISTS daily_yields CASCADE;
DROP TABLE IF EXISTS user_cycle_participation CASCADE;
DROP TABLE IF EXISTS cycles CASCADE;

-- Update users table for new system
ALTER TABLE users DROP COLUMN IF EXISTS total_yield_earned;
ALTER TABLE users DROP COLUMN IF EXISTS withdrawable_balance;
ALTER TABLE users DROP COLUMN IF EXISTS is_veteran;
ALTER TABLE users DROP COLUMN IF EXISTS first_cycle_completed;

-- Add new columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS available_balance DECIMAL(20, 6) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_balance DECIMAL(20, 6) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_profits DECIMAL(20, 6) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_withdrawn DECIMAL(20, 6) DEFAULT 0;

-- Create new investments table
CREATE TABLE IF NOT EXISTS investments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(20, 6) DEFAULT 100.00 NOT NULL,
    current_value DECIMAL(20, 6) DEFAULT 100.00 NOT NULL,
    yield_earned DECIMAL(20, 6) DEFAULT 0.00 NOT NULL,
    daily_percentage DECIMAL(5, 2) DEFAULT 1.00 NOT NULL,
    yield_goal DECIMAL(20, 6) DEFAULT 100.00 NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, unlocked, withdrawn
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unlocked_at TIMESTAMP,
    withdrawn_at TIMESTAMP,
    last_yield_calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT positive_investment_amount CHECK (amount > 0),
    CONSTRAINT positive_current_value CHECK (current_value >= amount)
);

-- Update withdrawals table for new system
DROP TABLE IF EXISTS withdrawals CASCADE;

CREATE TABLE withdrawals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    wallet_address VARCHAR(42) NOT NULL,
    gross_amount DECIMAL(20, 6) NOT NULL,
    tax_percentage DECIMAL(5, 2) DEFAULT 20.00 NOT NULL,
    tax_amount DECIMAL(20, 6) NOT NULL,
    net_amount DECIMAL(20, 6) NOT NULL,
    tx_hash VARCHAR(66),
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    CONSTRAINT positive_gross_amount CHECK (gross_amount > 0),
    CONSTRAINT positive_net_amount CHECK (net_amount > 0)
);

-- Update global_stats table
ALTER TABLE global_stats DROP COLUMN IF EXISTS withdrawals_unlocked;
ALTER TABLE global_stats DROP COLUMN IF EXISTS unlock_date;
ALTER TABLE global_stats DROP COLUMN IF EXISTS last_yield_calculation;
ALTER TABLE global_stats DROP COLUMN IF EXISTS cycle_active;
ALTER TABLE global_stats DROP COLUMN IF EXISTS cycle_start_date;
ALTER TABLE global_stats DROP COLUMN IF EXISTS cycle_number;
ALTER TABLE global_stats DROP COLUMN IF EXISTS cycle_deposits;
ALTER TABLE global_stats DROP COLUMN IF EXISTS cycle_active_wallets;

ALTER TABLE global_stats ADD COLUMN IF NOT EXISTS total_investments DECIMAL(20, 6) DEFAULT 0;
ALTER TABLE global_stats ADD COLUMN IF NOT EXISTS total_withdrawn DECIMAL(20, 6) DEFAULT 0;
ALTER TABLE global_stats ADD COLUMN IF NOT EXISTS active_investments INTEGER DEFAULT 0;
ALTER TABLE global_stats ADD COLUMN IF NOT EXISTS completed_investments INTEGER DEFAULT 0;
ALTER TABLE global_stats ADD COLUMN IF NOT EXISTS last_yield_calculation TIMESTAMP;

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_investments_user ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status);
CREATE INDEX IF NOT EXISTS idx_investments_created ON investments(created_at);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_wallet ON withdrawals(wallet_address);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);

-- Add comments for documentation
COMMENT ON TABLE investments IS 'Tracks individual 100 USDT investments with 1% daily compound yield';
COMMENT ON COLUMN investments.amount IS 'Fixed investment amount (always 100 USDT)';
COMMENT ON COLUMN investments.current_value IS 'Current value with accumulated yield';
COMMENT ON COLUMN investments.yield_earned IS 'Total yield earned (goal: 100 USDT)';
COMMENT ON COLUMN investments.daily_percentage IS 'Daily yield percentage (default: 1%)';
COMMENT ON COLUMN investments.status IS 'active: earning yield, unlocked: ready to withdraw/reinvest, withdrawn: completed';

COMMENT ON TABLE withdrawals IS 'Tracks all withdrawals with 20% tax';
COMMENT ON COLUMN withdrawals.gross_amount IS 'Total amount before tax';
COMMENT ON COLUMN withdrawals.tax_amount IS 'Tax collected (20% of gross)';
COMMENT ON COLUMN withdrawals.net_amount IS 'Net amount sent to user (80% of gross)';

COMMENT ON COLUMN users.available_balance IS 'Deposits not yet invested';
COMMENT ON COLUMN users.referral_balance IS 'Earnings from referrals';
COMMENT ON COLUMN users.locked_profits IS 'Profits from completed reinvestments';

-- Reset global stats for new system
UPDATE global_stats SET
    total_investments = 0,
    total_withdrawn = 0,
    active_investments = 0,
    completed_investments = 0,
    last_yield_calculation = NULL;

COMMIT;

-- Display migration summary
DO $$
BEGIN
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'New System Features:';
    RAISE NOTICE '- Fixed 100 USDT investments';
    RAISE NOTICE '- 1%% daily compound yield';
    RAISE NOTICE '- 100 USDT yield goal (200 USDT total)';
    RAISE NOTICE '- 20%% withdrawal tax on all withdrawals';
    RAISE NOTICE '- Referral system unchanged (10%%, 5%%, 3%%, 2%%, 1%%)';
    RAISE NOTICE '==========================================';
END $$;
