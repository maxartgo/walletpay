/**
 * Script per verificare il problema con i referral dei nuovi utenti
 */

import { pool } from '../src/config/database.js';

async function checkReferralIssue() {
  try {
    console.log('🔍 Checking referral issue...\n');

    const REFERRER = '0xfbe8b060e1eb88987d65039b6f6c27d90505ed02';

    // 1. Trova il referrer
    console.log(`📋 Referrer: ${REFERRER}\n`);

    const referrer = await pool.query(
      'SELECT * FROM users WHERE LOWER(wallet_address) = LOWER($1)',
      [REFERRER]
    );

    if (referrer.rows.length === 0) {
      console.log('❌ Referrer not found!');
      process.exit(1);
    }

    const referrerData = referrer.rows[0];
    console.log('👤 Referrer info:');
    console.log(`   ID: ${referrerData.id}`);
    console.log(`   Total Referral Earned: ${referrerData.total_referral_earned} USDT`);
    console.log(`   Referral Balance: ${referrerData.referral_balance} USDT`);
    console.log(`   Direct Referrals: ${referrerData.direct_referrals}`);
    console.log(`   Level 2 Referrals: ${referrerData.level2_referrals}`);
    console.log('');

    // 2. Trova tutti gli utenti che hanno questo come referrer
    const referred = await pool.query(
      'SELECT * FROM users WHERE LOWER(referrer_address) = LOWER($1) ORDER BY created_at DESC',
      [REFERRER]
    );

    console.log(`📊 Found ${referred.rows.length} users with this referrer:\n`);

    for (const user of referred.rows) {
      console.log(`   Wallet: ${user.wallet_address}`);
      console.log(`   Total Deposited: ${user.total_deposited} USDT`);
      console.log(`   Created: ${user.created_at}`);
      console.log('');
    }

    // 3. Controlla i depositi recenti (ultimi 3 giorni)
    const recentDeposits = await pool.query(`
      SELECT d.*, u.wallet_address, u.referrer_address
      FROM deposits d
      JOIN users u ON d.user_id = u.id
      WHERE d.created_at > NOW() - INTERVAL '3 days'
      ORDER BY d.created_at DESC
    `);

    console.log(`💰 Recent deposits (last 3 days): ${recentDeposits.rows.length}\n`);

    for (const deposit of recentDeposits.rows) {
      console.log(`   User: ${deposit.wallet_address}`);
      console.log(`   Referrer: ${deposit.referrer_address || 'NONE'}`);
      console.log(`   Amount: ${deposit.amount} USDT`);
      console.log(`   Status: ${deposit.status}`);
      console.log(`   Created: ${deposit.created_at}`);
      console.log('');
    }

    // 4. Controlla referral_earnings recenti
    const recentEarnings = await pool.query(`
      SELECT re.*,
             u_referrer.wallet_address as referrer_wallet,
             u_referred.wallet_address as referred_wallet
      FROM referral_earnings re
      JOIN users u_referrer ON re.referrer_id = u_referrer.id
      JOIN users u_referred ON re.referee_id = u_referred.id
      WHERE re.created_at > NOW() - INTERVAL '3 days'
      ORDER BY re.created_at DESC
    `);

    console.log(`🤝 Recent referral earnings (last 3 days): ${recentEarnings.rows.length}\n`);

    for (const earning of recentEarnings.rows) {
      console.log(`   Referrer: ${earning.referrer_wallet}`);
      console.log(`   Referred: ${earning.referred_wallet}`);
      console.log(`   Level: ${earning.level}`);
      console.log(`   Amount: ${earning.amount} USDT`);
      console.log(`   Deposit ID: ${earning.deposit_id}`);
      console.log(`   Created: ${earning.created_at}`);
      console.log('');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkReferralIssue();
