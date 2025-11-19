import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'walletpay',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

async function setupDatabase() {
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    // Step 1: Create withdrawals table
    console.log('\n📝 Step 1: Creating withdrawals table...');
    const createTableSQL = `
      -- Create withdrawals table if it doesn't exist
      CREATE TABLE IF NOT EXISTS withdrawals (
          id SERIAL PRIMARY KEY,
          wallet_address VARCHAR(42) NOT NULL,
          amount DECIMAL(20, 6) NOT NULL,
          type VARCHAR(20) DEFAULT 'regular',
          status VARCHAR(20) DEFAULT 'pending',
          tx_hash VARCHAR(66),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          completed_at TIMESTAMP,
          CONSTRAINT positive_withdrawal_amount CHECK (amount > 0)
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_withdrawals_wallet ON withdrawals(wallet_address);
      CREATE INDEX IF NOT EXISTS idx_withdrawals_created_at ON withdrawals(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
      CREATE INDEX IF NOT EXISTS idx_withdrawals_type ON withdrawals(type);
    `;

    await client.query(createTableSQL);
    console.log('✅ Withdrawals table created');

    // Step 2: Create admins table and add admin fields
    console.log('\n📝 Step 2: Setting up admin system...');
    const adminSystemSQL = `
      -- Create admins table
      CREATE TABLE IF NOT EXISTS admins (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          email VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_login TIMESTAMP
      );

      -- Add admin management fields to withdrawals
      ALTER TABLE withdrawals
      ADD COLUMN IF NOT EXISTS admin_note TEXT,
      ADD COLUMN IF NOT EXISTS processed_by INTEGER REFERENCES admins(id),
      ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP;

      -- Create index for admin queries
      CREATE INDEX IF NOT EXISTS idx_withdrawals_status_pending ON withdrawals(status) WHERE status = 'pending';

      -- Insert default admin (username: admin, password: admin123)
      INSERT INTO admins (username, password_hash, email)
      VALUES ('admin', '$2b$10$3ltbqHP5J64IGfhQqjMJEOghkHgLgEq0WufIY50vEe5qesnYwI.6G', 'admin@walletpay.com')
      ON CONFLICT (username) DO NOTHING;
    `;

    await client.query(adminSystemSQL);
    console.log('✅ Admin system setup completed');

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n🔐 Default Admin Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('\n🌐 Access admin panel at: http://localhost:5173/admin/login');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    throw error;
  } finally {
    await client.end();
  }
}

setupDatabase()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed:', error.message);
    process.exit(1);
  });
