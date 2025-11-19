import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'walletpay2',
  user: 'postgres',
  password: 'admin123',
});

async function createTestUser() {
  try {
    // Create user
    const userResult = await pool.query(
      `INSERT INTO users (
        wallet_address,
        total_deposited,
        available_balance,
        referral_balance,
        locked_profits,
        total_withdrawn,
        total_referral_earned,
        direct_referrals,
        level2_referrals,
        level3_referrals,
        level4_referrals,
        level5_referrals
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        '0x50aa1a7da0c6e2db276b7970fc424d6255a3b9e5',
        300.00,  // total_deposited
        150.00,  // available_balance
        50.00,   // referral_balance
        0.00,    // locked_profits
        0.00,    // total_withdrawn
        50.00,   // total_referral_earned
        5,       // direct_referrals
        3,       // level2_referrals
        2,       // level3_referrals
        1,       // level4_referrals
        0        // level5_referrals
      ]
    );

    const user = userResult.rows[0];
    console.log('✅ User created:', user.id);
    console.log('   Wallet:', user.wallet_address);
    console.log('   Available Balance:', user.available_balance, 'USDT');
    console.log('   Referral Balance:', user.referral_balance, 'USDT');

    // Create an active investment
    const investmentResult = await pool.query(
      `INSERT INTO investments (
        user_id,
        amount,
        current_value,
        yield_earned,
        daily_percentage,
        yield_goal,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        user.id,
        100.00,  // amount
        130.00,  // current_value (30% progress)
        30.00,   // yield_earned
        1.00,    // daily_percentage
        100.00,  // yield_goal
        'active' // status
      ]
    );

    const investment = investmentResult.rows[0];
    console.log('\n💎 Investment created:', investment.id);
    console.log('   Amount:', investment.amount, 'USDT');
    console.log('   Current Value:', investment.current_value, 'USDT');
    console.log('   Yield Earned:', investment.yield_earned, 'USDT');
    console.log('   Status:', investment.status);

    // Create a deposit record
    await pool.query(
      `INSERT INTO deposits (
        user_id,
        wallet_address,
        amount,
        tx_hash,
        status
      ) VALUES ($1, $2, $3, $4, $5)`,
      [
        user.id,
        user.wallet_address,
        300.00,
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        'confirmed'
      ]
    );

    console.log('\n💰 Deposit created: 300 USDT\n');
    console.log('🎉 Test user setup complete!\n');

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await pool.end();
  }
}

createTestUser();
