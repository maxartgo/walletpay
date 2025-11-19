import { query } from '../config/database.js';
import { Deposit } from '../types/index.js';

export class DepositModel {
  static async create(
    userId: number,
    walletAddress: string,
    amount: number,
    txHash: string,
    blockNumber?: number
  ): Promise<Deposit> {
    const result = await query(
      `INSERT INTO deposits (user_id, wallet_address, amount, tx_hash, block_number, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [userId, walletAddress, amount, txHash, blockNumber || null]
    );
    return result.rows[0];
  }

  static async confirmDeposit(txHash: string, blockNumber: number): Promise<Deposit> {
    const result = await query(
      `UPDATE deposits
       SET status = 'confirmed',
           confirmed_at = CURRENT_TIMESTAMP,
           block_number = $2
       WHERE tx_hash = $1
       RETURNING *`,
      [txHash, blockNumber]
    );
    return result.rows[0];
  }

  static async findByTxHash(txHash: string): Promise<Deposit | null> {
    const result = await query(
      'SELECT * FROM deposits WHERE tx_hash = $1',
      [txHash]
    );
    return result.rows[0] || null;
  }

  static async getAllDeposits(): Promise<Deposit[]> {
    const result = await query(
      'SELECT * FROM deposits ORDER BY created_at DESC'
    );
    return result.rows;
  }

  static async getUserDeposits(userId: number): Promise<Deposit[]> {
    const result = await query(
      'SELECT * FROM deposits WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async getTotalConfirmedDeposits(): Promise<number> {
    const result = await query(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM deposits
       WHERE status = 'confirmed'`
    );
    return parseFloat(result.rows[0].total);
  }
}
