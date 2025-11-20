import { query } from '../config/database.js';
import { Deposit } from '../types/index.js';

export class DepositModel {
  static async create(
    userId: number,
    amount: number,
    txHash: string,
    referrerId?: number
  ): Promise<Deposit> {
    const result = await query(
      `INSERT INTO deposits (user_id, amount, tx_hash, referrer_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, amount, txHash, referrerId || null]
    );
    return result.rows[0];
  }

  static async confirmDeposit(txHash: string): Promise<Deposit> {
    const result = await query(
      `SELECT * FROM deposits WHERE tx_hash = $1`,
      [txHash]
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
       FROM deposits`
    );
    return parseFloat(result.rows[0].total);
  }
}
