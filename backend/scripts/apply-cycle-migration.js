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
    const migrationPath = path.join(__dirname, '..', '..', 'database', 'migrations', '003_add_cycle_tracking.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('\n📝 Applying cycle tracking migration...');
    await client.query(migrationSQL);
    console.log('✅ Migration applied successfully');

    // Initialize cycle fields for existing global_stats row
    console.log('\n🔄 Initializing cycle fields...');
    await client.query(`
      UPDATE global_stats
      SET cycle_active = FALSE,
          cycle_start_date = NULL,
          cycle_number = 0,
          cycle_deposits = 0,
          cycle_active_wallets = 0
      WHERE cycle_active IS NULL OR cycle_number IS NULL;
    `);
    console.log('✅ Cycle fields initialized');

    console.log('\n🎉 Cycle tracking system is ready!');
    console.log('\n📊 New yield system features:');
    console.log('   • 0.05% daily yield (changed from 0.1%)');
    console.log('   • System activates on first deposit >= 100 USDT');
    console.log('   • Only wallets with >= 100 USDT are active');
    console.log('   • Yield calculated on total platform deposits');
    console.log('   • All active wallets receive same daily amount');
    console.log('   • Cycle stops when goals reached');
    console.log('   • Admin can reset cycle to start new rotation');

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
