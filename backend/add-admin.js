import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'walletpay2',
  user: 'postgres',
  password: 'admin123',
});

async function addAdmin() {
  const client = await pool.connect();

  try {
    const walletAddress = '0x1aaccd0ea502d89443d7a70ce68fcff49200292e';
    const name = 'Test Admin';

    console.log('Adding admin wallet:', walletAddress);

    const result = await client.query(
      `INSERT INTO admin_wallets (wallet_address, name, is_active, created_at)
       VALUES ($1, $2, true, NOW())
       ON CONFLICT (wallet_address)
       DO UPDATE SET is_active = true, name = EXCLUDED.name
       RETURNING *`,
      [walletAddress, name]
    );

    console.log('✅ Admin wallet added successfully!');
    console.log(result.rows[0]);

  } catch (error) {
    console.error('❌ Error adding admin:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addAdmin();
