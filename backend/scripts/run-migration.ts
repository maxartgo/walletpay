/**
 * Script to run SQL migration file
 */

import { pool } from '../src/config/database.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  try {
    console.log('🔄 Running migration: 002_add_staking_tiers.sql\n');

    // Read migration file
    const migrationPath = join(__dirname, '../database/migrations/002_add_staking_tiers.sql');
    const sql = readFileSync(migrationPath, 'utf-8');

    // Execute migration
    await pool.query(sql);

    console.log('✅ Migration completed successfully!\n');

    // Verify columns were added
    const result = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
        AND column_name IN ('has_used_starter', 'premium_count')
      ORDER BY column_name
    `);

    console.log('📊 New columns in users table:');
    result.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type} (default: ${row.column_default})`);
    });

    const result2 = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'investments'
        AND column_name = 'staking_type'
    `);

    console.log('\n📊 New columns in investments table:');
    result2.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type}`);
    });

    console.log('\n✅ Database schema updated successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

runMigration();
