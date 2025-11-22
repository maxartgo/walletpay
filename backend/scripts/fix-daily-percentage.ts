/**
 * Script per correggere il daily_percentage da 1.0 a 0.7758 per gli staking esistenti
 */

import { pool } from '../src/config/database.js';

async function fixDailyPercentage() {
  try {
    console.log('🔧 Fixing daily_percentage for existing stakings...\n');

    // Aggiorna tutti gli investimenti con daily_percentage = 1.0
    const result = await pool.query(`
      UPDATE investments
      SET daily_percentage = 0.7758
      WHERE daily_percentage = 1.0
      RETURNING id, user_id, amount, daily_percentage
    `);

    if (result.rows.length === 0) {
      console.log('ℹ️  No stakings found with daily_percentage = 1.0');
      process.exit(0);
    }

    console.log(`✅ Updated ${result.rows.length} staking(s):\n`);
    result.rows.forEach((inv) => {
      console.log(`   Staking ID: ${inv.id} (User ${inv.user_id})`);
      console.log(`   Amount: ${inv.amount} USDT`);
      console.log(`   Daily Percentage: ${inv.daily_percentage}%\n`);
    });

    console.log('✅ Daily percentage fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixDailyPercentage();
