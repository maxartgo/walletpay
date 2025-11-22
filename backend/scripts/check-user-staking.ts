/**
 * Script per controllare gli staking di un utente
 */

import { pool } from '../src/config/database.js';
import { UserModel } from '../src/models/User.js';

const USER_ADDRESS = '0xfbe8b060e1eb88987d65039b6f6c27d90505ed02';

async function checkUserStaking() {
  try {
    console.log('🔍 Checking user staking...\n');
    console.log(`📝 User: ${USER_ADDRESS}\n`);

    // 1. Trova l'utente
    const user = await UserModel.findByWallet(USER_ADDRESS);
    if (!user) {
      console.error('❌ User not found!');
      process.exit(1);
    }

    console.log(`✅ User found: ID ${user.id}`);
    console.log(`   Available Balance: ${user.available_balance} USDT`);
    console.log(`   Referral Balance: ${user.referral_balance} USDT`);
    console.log(`   Locked Profits: ${user.locked_profits} USDT`);
    console.log(`   Total Deposited: ${user.total_deposited} USDT`);
    console.log(`   Referrer: ${user.referrer_address || 'None'}\n`);

    // 2. Trova gli investimenti/staking
    const investments = await pool.query(`
      SELECT id, amount, current_value, daily_yield, days_elapsed,
             unlock_value, status, created_at, unlocked_at
      FROM investments
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [user.id]);

    if (investments.rows.length === 0) {
      console.log('ℹ️  No staking/investments found for this user.');
      process.exit(0);
    }

    console.log(`📊 Found ${investments.rows.length} staking(s):\n`);

    investments.rows.forEach((inv, index) => {
      console.log(`${index + 1}. Staking ID: ${inv.id}`);
      console.log(`   Amount: ${inv.amount} USDT`);
      console.log(`   Current Value: ${inv.current_value} USDT`);
      console.log(`   Daily Yield: ${inv.daily_yield} USDT`);
      console.log(`   Days Elapsed: ${inv.days_elapsed}`);
      console.log(`   Unlock Value: ${inv.unlock_value} USDT`);
      console.log(`   Status: ${inv.status}`);
      console.log(`   Created: ${inv.created_at}`);
      if (inv.unlocked_at) {
        console.log(`   Unlocked: ${inv.unlocked_at}`);
      }
      console.log('');
    });

    const activeCount = investments.rows.filter(i => i.status === 'active').length;
    const unlockedCount = investments.rows.filter(i => i.status === 'unlocked').length;

    console.log(`📌 Summary:`);
    console.log(`   Active Stakings: ${activeCount}`);
    console.log(`   Unlocked Stakings: ${unlockedCount}`);
    console.log(`   Total Stakings: ${investments.rows.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUserStaking();
