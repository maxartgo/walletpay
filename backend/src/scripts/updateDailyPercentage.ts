import { pool } from '../config/database.js';

async function updateDailyPercentage() {
  try {
    console.log('📊 Updating daily_percentage for existing investments...');

    const result = await pool.query(
      'UPDATE investments SET daily_percentage = 0.7758 WHERE daily_percentage = 1 RETURNING id'
    );

    console.log(`✅ Updated ${result.rowCount} investments`);
    console.log(`   Changed daily_percentage from 1% to 0.7758%`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating daily_percentage:', error);
    process.exit(1);
  }
}

updateDailyPercentage();
