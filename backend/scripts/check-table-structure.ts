/**
 * Script per verificare la struttura delle tabelle
 */

import { pool } from '../src/config/database.js';

async function checkTableStructure() {
  try {
    console.log('🔍 Checking table structures...\n');

    // Controlla struttura referral_earnings
    const referralEarningsStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'referral_earnings'
      ORDER BY ordinal_position
    `);

    console.log('📋 Table: referral_earnings');
    console.log('Columns:');
    referralEarningsStructure.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log('');

    // Controlla struttura users
    const usersStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

    console.log('📋 Table: users');
    console.log('Columns:');
    usersStructure.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log('');

    // Controlla struttura deposits
    const depositsStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'deposits'
      ORDER BY ordinal_position
    `);

    console.log('📋 Table: deposits');
    console.log('Columns:');
    depositsStructure.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkTableStructure();
