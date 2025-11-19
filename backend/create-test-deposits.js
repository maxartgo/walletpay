import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'walletpay2',
  user: 'postgres',
  password: 'admin123',
});

async function createTestDeposits() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const walletAddress = '0x1aaccd0ea502d89443d7a70ce68fcff49200292e';
    const referrerAddress = '0x50aa1a7da0c6e2db276b7970fc424d6255a3b9e5'; // Wallet esistente come referrer

    console.log('Creating test deposits for:', walletAddress);

    // 0. Delete existing data for this user
    console.log('\n0. Cleaning existing data...');
    const existingUser = await client.query(
      'SELECT id FROM users WHERE LOWER(wallet_address) = LOWER($1)',
      [walletAddress]
    );

    if (existingUser.rows.length > 0) {
      const userId = existingUser.rows[0].id;
      await client.query('DELETE FROM investments WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM deposits WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM users WHERE id = $1', [userId]);
      console.log('✓ Existing data deleted');
    }

    // 1. Create user
    console.log('\n1. Creating user...');
    const userResult = await client.query(
      `INSERT INTO users (wallet_address, referrer_address, total_deposited, total_referral_earned, available_balance, referral_balance, locked_profits, total_withdrawn, created_at)
       VALUES ($1, $2, 0, 0, 0, 0, 0, 0, NOW())
       RETURNING *`,
      [walletAddress, referrerAddress]
    );
    const userId = userResult.rows[0].id;
    console.log('✓ User created with ID:', userId);

    // 2. Create deposits
    console.log('\n2. Creating deposits...');

    const deposits = [
      {
        amount: 1000,
        txHash: '0xtest11111111111111111111111111111111111111111111111111111111',
        blockNumber: 12345001,
        date: new Date('2024-01-15')
      },
      {
        amount: 500,
        txHash: '0xtest22222222222222222222222222222222222222222222222222222222',
        blockNumber: 12345002,
        date: new Date('2024-02-10')
      },
      {
        amount: 750,
        txHash: '0xtest33333333333333333333333333333333333333333333333333333333',
        blockNumber: 12345003,
        date: new Date('2024-03-05')
      }
    ];

    for (const deposit of deposits) {
      await client.query(
        `INSERT INTO deposits (user_id, wallet_address, amount, tx_hash, block_number, status, created_at)
         VALUES ($1, $2, $3, $4, $5, 'confirmed', $6)
         RETURNING *`,
        [userId, walletAddress, deposit.amount, deposit.txHash, deposit.blockNumber, deposit.date]
      );
      console.log(`✓ Deposit created: ${deposit.amount} USDT (${deposit.date.toISOString().split('T')[0]})`);
    }

    // 3. Update user total_deposited and available_balance
    const totalDeposited = deposits.reduce((sum, d) => sum + d.amount, 0);
    await client.query(
      'UPDATE users SET total_deposited = $1, available_balance = $2 WHERE id = $3',
      [totalDeposited, totalDeposited, userId]
    );
    console.log(`\n3. Updated user total_deposited: ${totalDeposited} USDT`);

    // 4. Create investments (NEW SYSTEM: always 100 USDT each)
    console.log('\n4. Creating investments...');

    // Calculate how many 100 USDT investments we can create
    const numInvestments = Math.floor(totalDeposited / 100);
    let totalInvested = 0;

    for (let i = 0; i < numInvestments; i++) {
      const amount = 100;
      const dailyPercentage = 1.0; // 1% daily
      const yieldGoal = 100; // Goal: 100 USDT yield

      // Calculate days since investment created
      const invDate = new Date('2024-01-15');
      invDate.setDate(invDate.getDate() + (i * 10)); // Space investments 10 days apart

      const now = new Date();
      const daysPassed = Math.floor((now - invDate) / (1000 * 60 * 60 * 24));

      // Calculate yield earned (1% daily until goal)
      const yieldEarned = Math.min(daysPassed * (amount * dailyPercentage / 100), yieldGoal);
      const currentValue = amount + yieldEarned;

      // Status: unlocked if yield goal reached
      const status = yieldEarned >= yieldGoal ? 'unlocked' : 'active';
      const unlockedAt = status === 'unlocked' ? new Date(invDate.getTime() + (100 * 24 * 60 * 60 * 1000)) : null;

      await client.query(
        `INSERT INTO investments (user_id, amount, current_value, yield_earned, daily_percentage, yield_goal, status, created_at, unlocked_at, last_yield_calculated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $8)
         RETURNING *`,
        [userId, amount, currentValue, yieldEarned, dailyPercentage, yieldGoal, status, invDate, unlockedAt]
      );

      totalInvested += amount;
      console.log(`✓ Investment #${i + 1} created: ${amount} USDT (${status})`);
      console.log(`  - Days passed: ${daysPassed}`);
      console.log(`  - Yield earned: ${yieldEarned.toFixed(2)} USDT`);
      console.log(`  - Current value: ${currentValue.toFixed(2)} USDT`);
    }

    // 5. Update user available_balance (subtract invested amount) and locked_profits
    await client.query(
      'UPDATE users SET available_balance = available_balance - $1, locked_profits = $2 WHERE id = $3',
      [totalInvested, totalInvested, userId]
    );
    console.log(`\n5. Updated user balances - invested: ${totalInvested} USDT`);

    // 6. Skip global stats update (will be calculated automatically)

    await client.query('COMMIT');

    console.log('\n✅ Test deposits created successfully!');
    console.log('\n=== Summary ===');
    console.log(`Wallet: ${walletAddress}`);
    console.log(`Total Deposits: ${totalDeposited} USDT`);
    console.log(`Total Invested: ${totalInvested} USDT`);
    console.log(`Number of investments: ${numInvestments}`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating test deposits:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createTestDeposits();
