-- Add wallet_address column to withdrawals table
ALTER TABLE withdrawals
ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(42);

-- Update existing records to populate wallet_address from users table
UPDATE withdrawals w
SET wallet_address = u.wallet_address
FROM users u
WHERE w.user_id = u.id AND w.wallet_address IS NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_withdrawals_wallet_address ON withdrawals(wallet_address);
