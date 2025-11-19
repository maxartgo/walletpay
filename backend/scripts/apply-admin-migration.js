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

async function applyMigration() {
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    // Read migration file
    const migrationPath = path.join(__dirname, '../../database/migrations/002_add_admin_system.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Applying migration...');
    const result = await client.query(sql);

    console.log('✅ Migration applied successfully!');
    console.log('\n📊 Results:');
    if (result && result.rows && result.rows.length > 0) {
      console.log(result.rows[0]);
    }

    console.log('\n🔐 Default Admin Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('\n🌐 Access admin panel at: http://localhost:5173/admin/login');

  } catch (error) {
    console.error('❌ Error applying migration:', error);
    throw error;
  } finally {
    await client.end();
  }
}

applyMigration()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed:', error.message);
    process.exit(1);
  });
