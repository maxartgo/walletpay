/**
 * Script per assegnare un referrer a un utente esistente
 * I futuri depositi di questo utente processeranno automaticamente i referral rewards
 */

import { pool } from '../src/config/database.js';
import { UserModel } from '../src/models/User.js';

const REFERRER_ADDRESS = '0xfbe8b060e1eb88987d65039b6f6c27d90505ed02'; // Il referrer
const USER_ADDRESS = '0x1aaccd0ea502d89443d7a70ce68fcff49200292e'; // L'utente che ha fatto il deposito

async function assignReferrer() {
  try {
    console.log('🔧 Assigning referrer to user...');
    console.log(`📝 Referrer: ${REFERRER_ADDRESS}`);
    console.log(`📝 User: ${USER_ADDRESS}\n`);

    // 1. Verifica che il referrer esista
    const referrer = await UserModel.findByWallet(REFERRER_ADDRESS);
    if (!referrer) {
      console.error('❌ Referrer not found! Run "npm run create:referrer" first.');
      process.exit(1);
    }
    console.log(`✅ Referrer found: ID ${referrer.id}`);

    // 2. Trova l'utente
    const user = await UserModel.findByWallet(USER_ADDRESS);
    if (!user) {
      console.error('❌ User not found!');
      process.exit(1);
    }
    console.log(`✅ User found: ID ${user.id}`);

    if (user.referrer_address) {
      console.log(`⚠️  User already has a referrer: ${user.referrer_address}`);
      console.log(`   Do you want to replace it? (This script will replace it)\n`);
    }

    // 3. Aggiorna l'utente con il nuovo referrer
    console.log(`🔄 Updating user's referrer_address...`);
    await pool.query(`
      UPDATE users
      SET referrer_address = $1
      WHERE id = $2
    `, [REFERRER_ADDRESS, user.id]);

    const updatedUser = await UserModel.findById(user.id);
    console.log(`✅ User updated!`);
    console.log(`   New referrer_address: ${updatedUser?.referrer_address}\n`);

    console.log('📌 Note: Future deposits from this user will automatically process referral rewards.');
    console.log('   Past deposits will NOT be retroactively processed.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

assignReferrer();
