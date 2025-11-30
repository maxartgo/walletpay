import { pool } from '../src/config/database.js';

async function checkUsers() {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) as total_users,
        COUNT(CASE WHEN total_deposited > 0 THEN 1 END) as paying_users,
        SUM(total_deposited) as total_deposits
      FROM users
    `);

    const users = await pool.query('SELECT wallet_address, total_deposited, premium_count, has_used_starter FROM users ORDER BY total_deposited DESC');

    console.log('📊 DATABASE:', process.env.DB_NAME);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Total users:', result.rows[0].total_users);
    console.log('Paying users:', result.rows[0].paying_users);
    console.log('Total deposits:', result.rows[0].total_deposits, 'USDT\n');

    console.log('Users list:');
    users.rows.forEach((user, i) => {
      console.log(`${i + 1}. ${user.wallet_address}`);
      console.log(`   Deposited: ${user.total_deposited} USDT`);
      console.log(`   Premium count: ${user.premium_count}`);
      console.log(`   Has used starter: ${user.has_used_starter}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
