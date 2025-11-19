import { query } from '../config/database.js';

export interface Withdrawal {
  id: number;
  user_id: number;
  wallet_address: string;
  gross_amount: number;
  tax_percentage: number;
  tax_amount: number;
  net_amount: number;
  tx_hash?: string;
  status: 'pending' | 'completed' | 'failed' | 'rejected';
  created_at: Date;
  completed_at?: Date;
}

export class WithdrawalModel {
  /**
   * Create withdrawal request with 20% tax
   */
  static async create(
    userId: number,
    walletAddress: string,
    grossAmount: number
  ): Promise<Withdrawal> {
    const taxPercentage = 20; // 20% tax
    const taxAmount = grossAmount * (taxPercentage / 100);
    const netAmount = grossAmount - taxAmount;

    const result = await query(
      `INSERT INTO withdrawals (
        user_id, wallet_address, gross_amount,
        tax_percentage, tax_amount, net_amount, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING *`,
      [userId, walletAddress, grossAmount, taxPercentage, taxAmount, netAmount]
    );

    console.log(`💸 Withdrawal created:`);
    console.log(`   Gross: ${grossAmount} USDT`);
    console.log(`   Tax (20%): ${taxAmount} USDT`);
    console.log(`   Net: ${netAmount} USDT`);

    return result.rows[0];
  }

  /**
   * Mark withdrawal as completed
   */
  static async markCompleted(withdrawalId: number, txHash: string): Promise<Withdrawal> {
    const result = await query(
      `UPDATE withdrawals
       SET status = 'completed',
           tx_hash = $1,
           completed_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [txHash, withdrawalId]
    );

    console.log(`✅ Withdrawal ${withdrawalId} completed: ${txHash}`);
    return result.rows[0];
  }

  /**
   * Mark withdrawal as failed
   */
  static async markFailed(withdrawalId: number): Promise<Withdrawal> {
    const result = await query(
      `UPDATE withdrawals
       SET status = 'failed'
       WHERE id = $1
       RETURNING *`,
      [withdrawalId]
    );

    console.log(`❌ Withdrawal ${withdrawalId} failed`);
    return result.rows[0];
  }

  /**
   * Get withdrawal by ID
   */
  static async getById(withdrawalId: number): Promise<Withdrawal | null> {
    const result = await query(
      'SELECT * FROM withdrawals WHERE id = $1',
      [withdrawalId]
    );
    return result.rows[0] || null;
  }

  /**
   * Get user withdrawals
   */
  static async getUserWithdrawals(userId: number): Promise<Withdrawal[]> {
    const result = await query(
      `SELECT * FROM withdrawals
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  /**
   * Get all pending withdrawals
   */
  static async getPendingWithdrawals(): Promise<Withdrawal[]> {
    const result = await query(
      `SELECT w.*, u.wallet_address
       FROM withdrawals w
       JOIN users u ON w.user_id = u.id
       WHERE w.status = 'pending'
       ORDER BY w.created_at ASC`
    );
    return result.rows;
  }

  /**
   * Get total withdrawn by user
   */
  static async getTotalWithdrawnByUser(userId: number): Promise<number> {
    const result = await query(
      `SELECT COALESCE(SUM(net_amount), 0) as total
       FROM withdrawals
       WHERE user_id = $1 AND status = 'completed'`,
      [userId]
    );
    return parseFloat(result.rows[0].total);
  }

  /**
   * Get total tax collected
   */
  static async getTotalTaxCollected(): Promise<number> {
    const result = await query(
      `SELECT COALESCE(SUM(tax_amount), 0) as total
       FROM withdrawals
       WHERE status = 'completed'`
    );
    return parseFloat(result.rows[0].total);
  }

  /**
   * Get withdrawal statistics
   */
  static async getStats() {
    const result = await query(
      `SELECT
         COUNT(*) as total_count,
         COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
         COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
         COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count,
         COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
         COALESCE(SUM(CASE WHEN status = 'completed' THEN gross_amount ELSE 0 END), 0) as total_gross,
         COALESCE(SUM(CASE WHEN status = 'completed' THEN tax_amount ELSE 0 END), 0) as total_tax,
         COALESCE(SUM(CASE WHEN status = 'completed' THEN net_amount ELSE 0 END), 0) as total_net
       FROM withdrawals`
    );

    return result.rows[0];
  }

  /**
   * Approve withdrawal (admin action)
   */
  static async approve(withdrawalId: number, txHash: string): Promise<Withdrawal> {
    const result = await query(
      `UPDATE withdrawals
       SET status = 'completed',
           tx_hash = $1,
           completed_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND status = 'pending'
       RETURNING *`,
      [txHash, withdrawalId]
    );

    if (result.rows.length === 0) {
      throw new Error('Withdrawal not found or already processed');
    }

    console.log(`✅ Withdrawal ${withdrawalId} approved by admin`);
    return result.rows[0];
  }

  /**
   * Reject withdrawal (admin action - refund user)
   */
  static async reject(withdrawalId: number): Promise<Withdrawal> {
    const withdrawal = await this.getById(withdrawalId);
    if (!withdrawal || withdrawal.status !== 'pending') {
      throw new Error('Withdrawal not found or already processed');
    }

    const result = await query(
      `UPDATE withdrawals
       SET status = 'rejected',
           completed_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [withdrawalId]
    );

    console.log(`❌ Withdrawal ${withdrawalId} rejected by admin`);
    return result.rows[0];
  }

  /**
   * Get all withdrawals (admin view)
   */
  static async getAllWithdrawals(status?: string): Promise<any[]> {
    let sql = `
      SELECT
        w.*,
        u.wallet_address,
        u.total_deposited,
        u.total_withdrawn
      FROM withdrawals w
      JOIN users u ON w.user_id = u.id
    `;

    const params: any[] = [];
    if (status) {
      sql += ` WHERE w.status = $1`;
      params.push(status);
    }

    sql += ` ORDER BY w.created_at DESC`;

    const result = await query(sql, params);
    return result.rows;
  }
}
