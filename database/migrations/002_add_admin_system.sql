-- Migration: Add admin system
-- Date: 2025-10-30

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Update withdrawals table to add admin management fields
ALTER TABLE withdrawals
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS admin_note TEXT,
ADD COLUMN IF NOT EXISTS processed_by INTEGER REFERENCES admins(id),
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP;

-- Create index for admin queries
CREATE INDEX IF NOT EXISTS idx_withdrawals_status_pending ON withdrawals(status) WHERE status = 'pending';

-- Insert default admin (username: admin, password: admin123)
-- Password hash for 'admin123' using bcrypt with salt rounds 10
INSERT INTO admins (username, password_hash, email)
VALUES ('admin', '$2b$10$3ltbqHP5J64IGfhQqjMJEOghkHgLgEq0WufIY50vEe5qesnYwI.6G', 'admin@walletpay.com')
ON CONFLICT (username) DO NOTHING;

SELECT 'Admin system setup completed successfully' as status;
