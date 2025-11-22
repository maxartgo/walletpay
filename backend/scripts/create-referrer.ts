/**
 * Script per creare un nuovo utente referrer nel database
 */

import { UserModel } from '../src/models/User.js';

const REFERRER_ADDRESS = '0x116853cbc68a04ed96510f73a61ce0d9b6e293a4';

async function createReferrer() {
  try {
    console.log('🔧 Creating referrer user...');
    console.log(`📝 Referrer address: ${REFERRER_ADDRESS}\n`);

    // Verifica se esiste già
    const existing = await UserModel.findByWallet(REFERRER_ADDRESS);
    if (existing) {
      console.log('✅ Referrer already exists!');
      console.log(`   ID: ${existing.id}`);
      console.log(`   Wallet: ${existing.wallet_address}`);
      console.log(`   Total Deposited: ${existing.total_deposited} USDT`);
      console.log(`   Referral Balance: ${existing.referral_balance} USDT`);
      process.exit(0);
    }

    // Crea il nuovo utente
    const newUser = await UserModel.create(REFERRER_ADDRESS);

    console.log('✅ Referrer created successfully!');
    console.log(`   ID: ${newUser.id}`);
    console.log(`   Wallet: ${newUser.wallet_address}`);
    console.log(`   Created: ${newUser.created_at}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating referrer:', error);
    process.exit(1);
  }
}

createReferrer();
