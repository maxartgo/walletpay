-- Add withdrawals table for tracking withdrawal history

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

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_withdrawals_wallet ON withdrawals(wallet_address);
CREATE INDEX IF NOT EXISTS idx_withdrawals_created_at ON withdrawals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_type ON withdrawals(type);

-- Display success message
SELECT 'Withdrawals table created successfully!' as message;
