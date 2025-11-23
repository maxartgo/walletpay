import { query } from '../config/database.js';
import { ReferralEarning } from '../types/index.js';

export class ReferralEarningModel {
  static async create(
    referrerId: number,
    refereeId: number,
    depositId: number,
    level: number,
    amount: number
  ): Promise<ReferralEarning> {
    const result = await query(
      `INSERT INTO referral_earnings (referrer_id, referee_id, deposit_id, level, amount)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [referrerId, refereeId, depositId, level, amount]
    );
    return result.rows[0];
  }

  static async getUserEarnings(userId: number): Promise<ReferralEarning[]> {
    const result = await query(
      `SELECT re.*, u.wallet_address as from_wallet, d.amount as deposit_amount
       FROM referral_earnings re
       JOIN users u ON u.id = re.referee_id
       JOIN deposits d ON d.id = re.deposit_id
       WHERE re.referrer_id = $1
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
       WHERE referrer_id = $1
       GROUP BY level
       ORDER BY level`,
      [userId]
    );
    return result.rows;
  }
}
