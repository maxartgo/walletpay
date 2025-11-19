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
    const migrationPath = path.join(__dirname, '..', '..', 'database', 'migrations', '004_multi_cycle_system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('\n📝 Applying multi-cycle system migration...');
    await client.query(migrationSQL);
    console.log('✅ Migration applied successfully');

    // Verify tables were created
    console.log('\n🔍 Verifying tables...');

    const tablesCheck = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('cycles', 'user_cycle_participation')
    `);

    console.log(`✅ Found ${tablesCheck.rows.length}/2 new tables`);
    tablesCheck.rows.forEach(row => {
      console.log(`   • ${row.table_name}`);
    });

    // Verify Cycle 1 exists
    const cycleCheck = await client.query('SELECT * FROM cycles WHERE cycle_number = 1');
    if (cycleCheck.rows.length > 0) {
      console.log('\n✅ Cycle 1 initialized');
      console.log(`   • Status: ${cycleCheck.rows[0].status}`);
      console.log(`   • Start Date: ${cycleCheck.rows[0].start_date}`);
      console.log(`   • Deposits: ${cycleCheck.rows[0].total_deposits} USDT`);
    }

    console.log('\n🎉 Multi-Cycle System is ready!');
    console.log('\n📊 New Features:');
    console.log('   • ✅ Cycle-based yield system');
    console.log('   • ✅ Veteran users (always withdraw)');
    console.log('   • ✅ New users (blocked until first cycle completes)');
    console.log('   • ✅ Veterans receive yields without depositing');
    console.log('   • ✅ Each cycle resets deposits to zero');
    console.log('   • ✅ Cycle completes at 10,000 USDT (no wallet count)');
    console.log('   • ✅ Auto-creation of new cycles');

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
