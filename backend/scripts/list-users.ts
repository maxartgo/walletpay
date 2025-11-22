/**
 * Script per vedere tutti gli utenti nel database
 */

import { pool } from '../src/config/database.js';

async function listUsers() {
  try {
    console.log('📋 Listing all users...\n');

    const result = await pool.query(`
      SELECT id, wallet_address, referrer_address, total_deposited,
             available_balance, referral_balance, created_at
      FROM users
      ORDER BY created_at DESC
    `);

    if (result.rows.length === 0) {
      console.log('ℹ️  No users found in database.');
      process.exit(0);
    }

    console.log(`Found ${result.rows.length} user(s):\n`);

    result.rows.forEach((user, index) => {
      console.log(`${index + 1}. User ID: ${user.id}`);
      console.log(`   Wallet: ${user.wallet_address}`);
      console.log(`   Referrer: ${user.referrer_address || 'None'}`);
      console.log(`   Total Deposited: ${user.total_deposited} USDT`);
      console.log(`   Available Balance: ${user.available_balance} USDT`);
      console.log(`   Referral Balance: ${user.referral_balance} USDT`);
      console.log(`   Created: ${user.created_at}`);
      console.log('');
    });

    // Mostra anche i depositi
    console.log('\n📦 Deposits:\n');
    const deposits = await pool.query(`
      SELECT d.id, d.user_id, u.wallet_address, d.amount, d.referrer_id, d.created_at
      FROM deposits d
      JOIN users u ON d.user_id = u.id
      ORDER BY d.created_at DESC
    `);

    deposits.rows.forEach((dep, index) => {
      console.log(`${index + 1}. Deposit ID: ${dep.id}`);
      console.log(`   User: ${dep.wallet_address}`);
      console.log(`   Amount: ${dep.amount} USDT`);
      console.log(`   Referrer ID: ${dep.referrer_id || 'None'}`);
      console.log(`   Created: ${dep.created_at}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

listUsers();
