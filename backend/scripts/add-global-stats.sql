-- Add global_stats table to existing database

-- Global stats table
CREATE TABLE IF NOT EXISTS global_stats (
  id SERIAL PRIMARY KEY,
  total_deposits DECIMAL(20, 6) DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  paying_users INTEGER DEFAULT 0,
  withdrawals_unlocked BOOLEAN DEFAULT FALSE,
  unlock_date TIMESTAMP,
  cycle_active BOOLEAN DEFAULT FALSE,
  cycle_number INTEGER DEFAULT 0,
  cycle_start_date TIMESTAMP,
  cycle_deposits DECIMAL(20, 6) DEFAULT 0,
  cycle_active_wallets INTEGER DEFAULT 0,
  last_yield_calculation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initialize global stats with default values
INSERT INTO global_stats (total_deposits, total_users, paying_users)
SELECT 0, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM global_stats);

SELECT 'Global stats table created successfully!' AS message;
