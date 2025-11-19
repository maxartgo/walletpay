-- Migration: Add withdrawals table
-- Date: 2025-10-30

-- Create withdrawals table if it doesn't exist
CREATE TABLE IF NOT EXISTS withdrawals (
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

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_withdrawals_wallet ON withdrawals(wallet_address);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_type ON withdrawals(type);

-- Verify table creation
SELECT 'Withdrawals table created successfully' as status;
