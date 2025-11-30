/**
 * Script to migrate existing users to the new two-tier staking system
 *
 * This script:
 * 1. Counts existing premium investments (100 USDT) for each user
 * 2. Sets their premium_count accordingly
 * 3. Leaves has_used_starter as FALSE (existing users haven't used it)
 */

import { pool } from '../src/config/database.js';

async function migrateExistingUsers() {
  try {
    console.log('🔄 Starting migration of existing users to two-tier system...\n');

    // Get all users
    const usersResult = await pool.query('SELECT * FROM users ORDER BY id ASC');
    const users = usersResult.rows;

    console.log(`📊 Found ${users.length} users to process\n`);

    let totalUpdated = 0;

    for (const user of users) {
      // Count premium investments (100 USDT) for this user
      const investmentsResult = await pool.query(
        `SELECT COUNT(*) as count
         FROM investments
         WHERE user_id = $1 AND amount = 100`,
        [user.id]
      );

      const premiumCount = parseInt(investmentsResult.rows[0].count);

      if (premiumCount > 0) {
        // Update user's premium_count
        await pool.query(
          `UPDATE users
           SET premium_count = $1
           WHERE id = $2`,
          [premiumCount, user.id]
        );

        console.log(`✅ User ${user.wallet_address}`);
        console.log(`   Premium count set to: ${premiumCount}`);
        console.log(`   Has used starter: FALSE (default)\n`);

        totalUpdated++;
      } else {
        console.log(`ℹ️  User ${user.wallet_address}`);
        console.log(`   No premium investments found`);
        console.log(`   Premium count: 0\n`);
      }
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✅ Migration complete!`);
    console.log(`   Total users: ${users.length}`);
    console.log(`   Users with premiums: ${totalUpdated}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    // Show summary stats
    const statsResult = await pool.query(`
      SELECT
        COUNT(*) as total_users,
        COUNT(CASE WHEN premium_count > 0 THEN 1 END) as users_with_premiums,
        COUNT(CASE WHEN has_used_starter = TRUE THEN 1 END) as users_with_starter,
        MAX(premium_count) as max_premium_count
      FROM users
    `);

    const stats = statsResult.rows[0];
    console.log('📊 Final Statistics:');
    console.log(`   Total users: ${stats.total_users}`);
    console.log(`   Users with premium investments: ${stats.users_with_premiums}`);
    console.log(`   Users who used starter: ${stats.users_with_starter}`);
    console.log(`   Max premium count: ${stats.max_premium_count}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migrateExistingUsers();
