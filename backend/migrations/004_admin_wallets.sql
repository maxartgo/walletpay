-- Admin Wallets Table
-- Stores authorized admin wallet addresses

CREATE TABLE IF NOT EXISTS admin_wallets (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Insert your admin wallet (replace with your actual wallet address)
-- INSERT INTO admin_wallets (wallet_address, name) VALUES ('0xYOUR_ADMIN_WALLET_HERE', 'Admin');

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_admin_wallets_address ON admin_wallets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_admin_wallets_active ON admin_wallets(is_active);

-- Add rejected status to withdrawals if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'withdrawal_status'
  ) THEN
    ALTER TABLE withdrawals
    ALTER COLUMN status TYPE VARCHAR(20);
  END IF;
END $$;

COMMENT ON TABLE admin_wallets IS 'Stores authorized admin wallet addresses for platform management';
