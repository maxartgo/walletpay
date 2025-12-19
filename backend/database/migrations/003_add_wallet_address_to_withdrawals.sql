-- Add missing columns to withdrawals table
ALTER TABLE withdrawals
ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(42),
ADD COLUMN IF NOT EXISTS tax_percentage DECIMAL(5,2) DEFAULT 12,
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(20,8) DEFAULT 0,
ADD COLUMN IF NOT EXISTS gross_amount DECIMAL(20,8),
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS tx_hash VARCHAR(66);

-- Make withdrawal_type nullable if it exists and is NOT NULL
ALTER TABLE withdrawals
ALTER COLUMN withdrawal_type DROP NOT NULL;

-- Update gross_amount for existing records (net_amount / 0.88 to reverse the 12% tax)
UPDATE withdrawals
SET gross_amount = ROUND(net_amount / 0.88, 8)
WHERE gross_amount IS NULL;

-- Update tax_amount for existing records
UPDATE withdrawals
SET tax_amount = ROUND(gross_amount * 0.12, 8)
WHERE tax_amount = 0 OR tax_amount IS NULL;

-- Update existing records to populate wallet_address from users table
UPDATE withdrawals w
SET wallet_address = u.wallet_address
FROM users u
WHERE w.user_id = u.id AND w.wallet_address IS NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_withdrawals_wallet_address ON withdrawals(wallet_address);
