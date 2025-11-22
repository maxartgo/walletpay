/**
 * Script per accreditare manualmente commissioni referral per un deposito già fatto
 */

import { pool } from '../src/config/database.js';
import { UserModel } from '../src/models/User.js';

const REFERRER_ADDRESS = '0x116853cbc68a04ed96510f73a61ce0d9b6e293a4'; // Il referrer che riceverà la commissione
const DEPOSITOR_ADDRESS = '0xfbe8b060e1eb88987d65039b6f6c27d90505ed02'; // L'utente che ha fatto il deposito
const DEPOSIT_AMOUNT = 100; // L'importo del deposito in USDT
const COMMISSION_RATE = 0.10; // 10% per livello 1

async function creditReferralManually() {
  try {
    console.log('🔧 Processing manual referral commission...\n');
    console.log(`📝 Referrer: ${REFERRER_ADDRESS}`);
    console.log(`📝 Depositor: ${DEPOSITOR_ADDRESS}`);
    console.log(`💰 Deposit Amount: ${DEPOSIT_AMOUNT} USDT`);
    console.log(`📊 Commission Rate: ${COMMISSION_RATE * 100}%\n`);

    // 1. Trova il referrer
    const referrer = await UserModel.findByWallet(REFERRER_ADDRESS);
    if (!referrer) {
      console.error('❌ Referrer not found!');
      process.exit(1);
    }
    console.log(`✅ Referrer found: ID ${referrer.id}`);
    console.log(`   Current referral balance: ${referrer.referral_balance} USDT`);
    console.log(`   Current total referral earned: ${referrer.total_referral_earned} USDT`);
    console.log(`   Current direct referrals: ${referrer.direct_referrals}\n`);

    // 2. Calcola la commissione
    const commission = DEPOSIT_AMOUNT * COMMISSION_RATE;
    console.log(`💵 Commission to credit: ${commission} USDT\n`);

    // 3. Accredita la commissione al referrer
    console.log(`🔄 Crediting commission to referrer...`);
    await pool.query(`
      UPDATE users
      SET referral_balance = referral_balance + $1,
          total_referral_earned = total_referral_earned + $1,
          direct_referrals = direct_referrals + 1
      WHERE id = $2
    `, [commission, referrer.id]);

    // 4. Mostra il risultato
    const updatedReferrer = await UserModel.findById(referrer.id);
    console.log(`✅ Commission credited successfully!\n`);

    console.log(`📊 Updated Referrer Status:`);
    console.log(`   Referral Balance: ${updatedReferrer?.referral_balance} USDT (+${commission})`);
    console.log(`   Total Referral Earned: ${updatedReferrer?.total_referral_earned} USDT (+${commission})`);
    console.log(`   Direct Referrals: ${updatedReferrer?.direct_referrals} (+1)\n`);

    console.log(`✅ Manual referral commission processed successfully!`);
    console.log(`\n📌 Note: The depositor (${DEPOSITOR_ADDRESS}) now has the referrer assigned.`);
    console.log(`   Future deposits will automatically process referral rewards.`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

creditReferralManually();
