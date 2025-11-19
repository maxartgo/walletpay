import { query } from '../config/database.js';
import { ReferralEarning } from '../types/index.js';

export class ReferralEarningModel {
  static async create(
    userId: number,
    fromUserId: number,
    depositId: number,
    level: number,
    percentage: number,
    amount: number
  ): Promise<ReferralEarning> {
    const result = await query(
      `INSERT INTO referral_earnings (user_id, from_user_id, deposit_id, level, percentage, amount)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, fromUserId, depositId, level, percentage, amount]
    );
    return result.rows[0];
  }

  static async getUserEarnings(userId: number): Promise<ReferralEarning[]> {
    const result = await query(
      `SELECT re.*, u.wallet_address as from_wallet, d.amount as deposit_amount
       FROM referral_earnings re
       JOIN users u ON u.id = re.from_user_id
       JOIN deposits d ON d.id = re.deposit_id
       WHERE re.user_id = $1
       ORDER BY re.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async getTotalEarningsByLevel(userId: number) {
    const result = await query(
      `SELECT
        level,
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as total
       FROM referral_earnings
       WHERE user_id = $1
       GROUP BY level
       ORDER BY level`,
      [userId]
    );
    return result.rows;
  }
}
