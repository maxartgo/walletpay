/**
 * Script per assegnare manualmente un referral a un deposito già fatto
 * e processare i referral rewards retroattivamente
 */

import { pool } from '../src/config/database.js';
import { UserModel } from '../src/models/User.js';
import { ReferralService } from '../src/services/ReferralService.js';

const REFERRER_ADDRESS = '0x116853cbc68a04ed96510f73a61ce0d9b6e293a4';

async function fixReferralDeposit() {
  try {
    console.log('🔧 Starting referral fix script...');
    console.log(`📝 Referrer address: ${REFERRER_ADDRESS}`);

    // 1. Trova il referrer
    const referrer = await UserModel.findByWallet(REFERRER_ADDRESS);
    if (!referrer) {
      console.error('❌ Referrer not found! The referrer must exist in the database first.');
      process.exit(1);
    }
    console.log(`✅ Referrer found: ID ${referrer.id}`);

    // 2. Trova l'ultimo deposito senza referrer
    const result = await pool.query(`
      SELECT d.id, d.user_id, d.amount, d.tx_hash, d.referrer_id, d.created_at,
             u.wallet_address as depositor_address
      FROM deposits d
      JOIN users u ON d.user_id = u.id
      WHERE d.referrer_id IS NULL
      ORDER BY d.created_at DESC
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      console.log('ℹ️  No deposits without referrer found.');
      process.exit(0);
    }

    const deposit = result.rows[0];
    console.log(`\n📦 Deposit to fix:`);
    console.log(`   ID: ${deposit.id}`);
    console.log(`   User: ${deposit.depositor_address}`);
    console.log(`   Amount: ${deposit.amount} USDT`);
    console.log(`   TX Hash: ${deposit.tx_hash}`);
    console.log(`   Created: ${deposit.created_at}`);

    // 3. Aggiorna l'utente con il referrer_address
    console.log(`\n🔄 Updating user's referrer_address...`);
    await pool.query(`
      UPDATE users
      SET referrer_address = $1
      WHERE id = $2
    `, [REFERRER_ADDRESS, deposit.user_id]);
    console.log(`✅ User updated with referrer_address`);

    // 4. Aggiorna il deposito con referrer_id
    console.log(`\n🔄 Updating deposit's referrer_id...`);
    await pool.query(`
      UPDATE deposits
      SET referrer_id = $1
      WHERE id = $2
    `, [referrer.id, deposit.id]);
    console.log(`✅ Deposit updated with referrer_id`);

    // 5. Processa i referral rewards retroattivamente
    console.log(`\n💰 Processing referral rewards...`);
    await ReferralService.processReferralRewards(
      deposit.depositor_address,
      deposit.id,
      parseFloat(deposit.amount),
      deposit.user_id
    );
    console.log(`✅ Referral rewards processed!`);

    // 6. Mostra il risultato finale
    console.log(`\n📊 Final status:`);
    const updatedReferrer = await UserModel.findById(referrer.id);
    const updatedDepositor = await UserModel.findById(deposit.user_id);

    console.log(`\nReferrer (${REFERRER_ADDRESS}):`);
    console.log(`   Referral Balance: ${updatedReferrer?.referral_balance} USDT`);
    console.log(`   Total Referral Earned: ${updatedReferrer?.total_referral_earned} USDT`);
    console.log(`   Direct Referrals: ${updatedReferrer?.direct_referrals}`);

    console.log(`\nDepositor (${deposit.depositor_address}):`);
    console.log(`   Referrer Address: ${updatedDepositor?.referrer_address}`);
    console.log(`   Total Deposited: ${updatedDepositor?.total_deposited} USDT`);

    console.log('\n✅ Referral fix completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error fixing referral:', error);
    process.exit(1);
  }
}

// Esegui lo script
fixReferralDeposit();
