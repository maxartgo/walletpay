/**
 * Script per processare manualmente i referral mancanti
 */

import { pool } from '../src/config/database.js';

const REFERRAL_LEVELS = [
  { level: 1, percentage: 10 },
  { level: 2, percentage: 5 },
  { level: 3, percentage: 3 },
  { level: 4, percentage: 2 },
  { level: 5, percentage: 1 },
];

async function getReferralChain(walletAddress: string, maxLevel: number = 5) {
  const chain: any[] = [];
  let currentWallet = walletAddress;

  for (let i = 0; i < maxLevel; i++) {
    const user = await pool.query(
      'SELECT * FROM users WHERE LOWER(wallet_address) = LOWER($1)',
      [currentWallet]
    );

    if (user.rows.length === 0 || !user.rows[0].referrer_address) break;

    const referrer = await pool.query(
      'SELECT * FROM users WHERE LOWER(wallet_address) = LOWER($1)',
      [user.rows[0].referrer_address]
    );

    if (referrer.rows.length === 0) break;

    chain.push(referrer.rows[0]);
    currentWallet = referrer.rows[0].wallet_address;
  }

  return chain;
}

async function processReferralRewards(
  userWallet: string,
  depositId: number,
  depositAmount: number,
  userId: number
) {
  console.log(`\n🔗 Processing referral rewards for deposit ${depositId}`);
  console.log(`   User: ${userWallet}`);
  console.log(`   Amount: ${depositAmount} USDT\n`);

  const referralChain = await getReferralChain(userWallet, 5);

  if (referralChain.length === 0) {
    console.log('   ℹ️  No referrers found in chain');
    return;
  }

  console.log(`   Found ${referralChain.length} referrer(s) in chain\n`);

  for (let i = 0; i < referralChain.length; i++) {
    const referrer = referralChain[i];
    const levelConfig = REFERRAL_LEVELS[i];

    if (!levelConfig) break;

    const rewardAmount = (depositAmount * levelConfig.percentage) / 100;

    console.log(`   Level ${levelConfig.level}: ${referrer.wallet_address}`);
    console.log(`   Reward: ${rewardAmount} USDT (${levelConfig.percentage}%)`);

    // Verifica se già esiste questo earning
    const existingEarning = await pool.query(
      `SELECT * FROM referral_earnings
       WHERE user_id = $1 AND from_user_id = $2 AND deposit_id = $3 AND level = $4`,
      [referrer.id, userId, depositId, levelConfig.level]
    );

    if (existingEarning.rows.length > 0) {
      console.log('   ⚠️  Already exists, skipping...\n');
      continue;
    }

    // Crea referral earning record
    await pool.query(
      `INSERT INTO referral_earnings (user_id, from_user_id, deposit_id, level, percentage, amount)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [referrer.id, userId, depositId, levelConfig.level, levelConfig.percentage, rewardAmount]
    );

    // Aggiorna il bilancio del referrer
    const columnMap: { [key: number]: string } = {
      1: 'direct_referrals',
      2: 'level2_referrals',
      3: 'level3_referrals',
      4: 'level4_referrals',
      5: 'level5_referrals',
    };

    await pool.query(
      `UPDATE users
       SET total_referral_earned = total_referral_earned + $1,
           referral_balance = referral_balance + $1,
           ${columnMap[levelConfig.level]} = ${columnMap[levelConfig.level]} + 1
       WHERE id = $2`,
      [rewardAmount, referrer.id]
    );

    console.log('   ✅ Processed successfully\n');
  }
}

async function fixMissingReferrals() {
  try {
    console.log('🔧 Fixing missing referrals...\n');

    // Trova tutti i depositi recenti che potrebbero non avere referral processati
    const deposits = await pool.query(`
      SELECT d.*, u.wallet_address, u.referrer_address
      FROM deposits d
      JOIN users u ON d.user_id = u.id
      WHERE d.created_at > NOW() - INTERVAL '7 days'
        AND u.referrer_address IS NOT NULL
      ORDER BY d.created_at ASC
    `);

    console.log(`📊 Found ${deposits.rows.length} deposits with referrers in last 7 days\n`);

    for (const deposit of deposits.rows) {
      // Verifica se questo deposito ha già referral earnings
      const existingEarnings = await pool.query(
        'SELECT COUNT(*) as count FROM referral_earnings WHERE deposit_id = $1',
        [deposit.id]
      );

      if (parseInt(existingEarnings.rows[0].count) > 0) {
        console.log(`✓ Deposit ${deposit.id} (${deposit.wallet_address}) already has referral earnings, skipping...`);
        continue;
      }

      console.log(`❌ Deposit ${deposit.id} (${deposit.wallet_address}) missing referral earnings!`);

      await processReferralRewards(
        deposit.wallet_address,
        deposit.id,
        parseFloat(deposit.amount),
        deposit.user_id
      );
    }

    console.log('\n✅ All missing referrals processed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixMissingReferrals();
