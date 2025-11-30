-- Migration: Add staking tier system (Starter 50 USDT + Premium tiered system)
-- Date: 2025-11-29

-- Add new columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS has_used_starter BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS premium_count INTEGER DEFAULT 0;

-- Add new columns to investments table
ALTER TABLE investments
ADD COLUMN IF NOT EXISTS staking_type VARCHAR(20) DEFAULT 'premium';

-- Add comment to explain staking types
COMMENT ON COLUMN investments.staking_type IS 'Staking type: starter (50 USDT, 0.45%), premium (100 USDT, variable %)';

-- Update existing investments to be 'premium' type (since they're all 100 USDT)
UPDATE investments SET staking_type = 'premium' WHERE amount = 100;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_investments_staking_type ON investments(staking_type);
CREATE INDEX IF NOT EXISTS idx_users_has_used_starter ON users(has_used_starter);

-- Output migration completed
SELECT 'Migration 002_add_staking_tiers completed successfully' AS status;
