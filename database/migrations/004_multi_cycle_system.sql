-- Multi-Cycle System Migration
-- Creates tables for cycle management with veteran/new user distinction

-- ============================================================================
-- 1. Create cycles table
-- ============================================================================
CREATE TABLE IF NOT EXISTS cycles (
    id SERIAL PRIMARY KEY,
    cycle_number INTEGER UNIQUE NOT NULL,
    start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    total_deposits DECIMAL(20, 6) DEFAULT 0,
    active_wallets INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for cycle queries
CREATE INDEX IF NOT EXISTS idx_cycles_status ON cycles(status);
CREATE INDEX IF NOT EXISTS idx_cycles_number ON cycles(cycle_number);

-- ============================================================================
-- 2. Create user_cycle_participation table
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_cycle_participation (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    cycle_id INTEGER REFERENCES cycles(id) ON DELETE CASCADE,
    deposited_amount DECIMAL(20, 6) DEFAULT 0,
    total_yield_earned DECIMAL(20, 6) DEFAULT 0,
    first_deposit_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, cycle_id),
    CONSTRAINT positive_deposit CHECK (deposited_amount >= 0),
    CONSTRAINT positive_yield CHECK (total_yield_earned >= 0)
);

-- Indexes for participation queries
CREATE INDEX IF NOT EXISTS idx_ucp_user ON user_cycle_participation(user_id);
CREATE INDEX IF NOT EXISTS idx_ucp_cycle ON user_cycle_participation(cycle_id);
CREATE INDEX IF NOT EXISTS idx_ucp_user_cycle ON user_cycle_participation(user_id, cycle_id);

-- ============================================================================
-- 3. Add veteran status to users table
-- ============================================================================
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_veteran BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS first_cycle_completed INTEGER REFERENCES cycles(id);

-- Index for veteran queries
CREATE INDEX IF NOT EXISTS idx_users_veteran ON users(is_veteran);

-- ============================================================================
-- 4. Add cycle_id to daily_yields table
-- ============================================================================
ALTER TABLE daily_yields
ADD COLUMN IF NOT EXISTS cycle_id INTEGER REFERENCES cycles(id);

-- Index for cycle-based yield queries
CREATE INDEX IF NOT EXISTS idx_daily_yields_cycle ON daily_yields(cycle_id);
CREATE INDEX IF NOT EXISTS idx_daily_yields_user_cycle ON daily_yields(user_id, cycle_id);

-- ============================================================================
-- 5. Remove old cycle tracking fields from global_stats
-- ============================================================================
-- These are replaced by the cycles table
ALTER TABLE global_stats
DROP COLUMN IF EXISTS cycle_active,
DROP COLUMN IF EXISTS cycle_start_date,
DROP COLUMN IF EXISTS cycle_number,
DROP COLUMN IF EXISTS cycle_deposits,
DROP COLUMN IF EXISTS cycle_active_wallets;

-- ============================================================================
-- 6. Update trigger for cycles table
-- ============================================================================
CREATE TRIGGER update_cycles_updated_at BEFORE UPDATE ON cycles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_cycle_participation_updated_at BEFORE UPDATE ON user_cycle_participation
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. Comments for documentation
-- ============================================================================
COMMENT ON TABLE cycles IS 'Tracks each yield cycle with deposits and completion status';
COMMENT ON TABLE user_cycle_participation IS 'Tracks user deposits and earnings per cycle';

COMMENT ON COLUMN users.is_veteran IS 'TRUE if user has completed at least one cycle (can always withdraw)';
COMMENT ON COLUMN users.first_cycle_completed IS 'ID of first cycle completed by user';

COMMENT ON COLUMN daily_yields.cycle_id IS 'Links yield calculation to specific cycle';

-- ============================================================================
-- 8. Initialize first cycle
-- ============================================================================
-- Create Cycle 1 if it doesn't exist
INSERT INTO cycles (cycle_number, status, total_deposits, active_wallets)
VALUES (1, 'active', 0, 0)
ON CONFLICT (cycle_number) DO NOTHING;
