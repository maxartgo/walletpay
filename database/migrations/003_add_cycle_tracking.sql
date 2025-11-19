-- Add cycle tracking fields to global_stats table
ALTER TABLE global_stats
ADD COLUMN IF NOT EXISTS cycle_active BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS cycle_start_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS cycle_number INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cycle_deposits DECIMAL(20, 6) DEFAULT 0,
ADD COLUMN IF NOT EXISTS cycle_active_wallets INTEGER DEFAULT 0;

-- Add index for cycle queries
CREATE INDEX IF NOT EXISTS idx_global_stats_cycle_active ON global_stats(cycle_active);

-- Comment on new columns
COMMENT ON COLUMN global_stats.cycle_active IS 'Whether the yield calculation cycle is currently active';
COMMENT ON COLUMN global_stats.cycle_start_date IS 'When the current cycle started (first deposit >= 100 USDT)';
COMMENT ON COLUMN global_stats.cycle_number IS 'Sequential cycle number for tracking rotations';
COMMENT ON COLUMN global_stats.cycle_deposits IS 'Total deposits in the current cycle';
COMMENT ON COLUMN global_stats.cycle_active_wallets IS 'Number of active wallets (deposited >= 100 USDT) in current cycle';
