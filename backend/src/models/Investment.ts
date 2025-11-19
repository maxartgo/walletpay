import { query } from '../config/database.js';

export interface Investment {
  id: number;
  user_id: number;
  amount: number;
  current_value: number;
  yield_earned: number;
  daily_percentage: number;
  yield_goal: number;
  status: 'active' | 'unlocked' | 'withdrawn';
  created_at: Date;
  unlocked_at?: Date;
  withdrawn_at?: Date;
  last_yield_calculated_at: Date;
}

export class InvestmentModel {
  /**
   * Create new investment (always 100 USDT)
   */
  static async create(userId: number): Promise<Investment> {
    const result = await query(
      `INSERT INTO investments (
        user_id, amount, current_value, yield_earned,
        daily_percentage, yield_goal, status, last_yield_calculated_at
      )
      VALUES ($1, 100, 100, 0, 1.0, 100, 'active', CURRENT_TIMESTAMP)
      RETURNING *`,
      [userId]
    );

    console.log(`💎 New investment created for user ${userId}: 100 USDT`);
    return result.rows[0];
  }

  /**
   * Get investment by ID
   */
  static async getById(investmentId: number): Promise<Investment | null> {
    const result = await query(
      'SELECT * FROM investments WHERE id = $1',
      [investmentId]
    );
    return result.rows[0] || null;
  }

  /**
   * Get all active investments for user
   */
  static async getUserActiveInvestments(userId: number): Promise<Investment[]> {
    const result = await query(
      `SELECT * FROM investments
       WHERE user_id = $1 AND status = 'active'
       ORDER BY created_at ASC`,
      [userId]
    );
    return result.rows;
  }

  /**
   * Get all unlocked investments for user
   */
  static async getUserUnlockedInvestments(userId: number): Promise<Investment[]> {
    const result = await query(
      `SELECT * FROM investments
       WHERE user_id = $1 AND status = 'unlocked'
       ORDER BY unlocked_at ASC`,
      [userId]
    );
    return result.rows;
  }

  /**
   * Get all investments for user
   */
  static async getUserInvestments(userId: number): Promise<Investment[]> {
    const result = await query(
      `SELECT * FROM investments
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  /**
   * Update investment value with daily yield (compound)
   */
  static async applyDailyYield(investmentId: number): Promise<Investment> {
    const investment = await this.getById(investmentId);
    if (!investment || investment.status !== 'active') {
      throw new Error('Investment not found or not active');
    }

    // Calculate compound yield: value = value * (1 + daily_percentage/100)
    const dailyRate = investment.daily_percentage / 100;
    const newValue = investment.current_value * (1 + dailyRate);
    const newYield = newValue - investment.amount;

    // Check if goal reached
    let newStatus = investment.status;
    let unlockedAt = investment.unlocked_at;

    if (newYield >= investment.yield_goal && investment.status === 'active') {
      newStatus = 'unlocked';
      unlockedAt = new Date();
      console.log(`🎉 Investment ${investmentId} unlocked! Value: ${newValue.toFixed(2)} USDT`);
    }

    const result = await query(
      `UPDATE investments
       SET current_value = $1,
           yield_earned = $2,
           status = $3,
           unlocked_at = $4,
           last_yield_calculated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [newValue, newYield, newStatus, unlockedAt, investmentId]
    );

    return result.rows[0];
  }

  /**
   * Mark investment as withdrawn
   */
  static async markAsWithdrawn(investmentId: number): Promise<Investment> {
    const result = await query(
      `UPDATE investments
       SET status = 'withdrawn',
           withdrawn_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [investmentId]
    );

    console.log(`💸 Investment ${investmentId} withdrawn`);
    return result.rows[0];
  }

  /**
   * Get total value of all unlocked investments for user
   */
  static async getTotalUnlockedValue(userId: number): Promise<number> {
    const result = await query(
      `SELECT COALESCE(SUM(current_value), 0) as total
       FROM investments
       WHERE user_id = $1 AND status = 'unlocked'`,
      [userId]
    );
    return parseFloat(result.rows[0].total);
  }

  /**
   * Count active investments globally
   */
  static async countActiveInvestments(): Promise<number> {
    const result = await query(
      `SELECT COUNT(*) as count
       FROM investments
       WHERE status = 'active'`
    );
    return parseInt(result.rows[0].count);
  }

  /**
   * Count completed investments globally
   */
  static async countCompletedInvestments(): Promise<number> {
    const result = await query(
      `SELECT COUNT(*) as count
       FROM investments
       WHERE status IN ('unlocked', 'withdrawn')`
    );
    return parseInt(result.rows[0].count);
  }

  /**
   * Get all active investments that need yield calculation
   */
  static async getAllActiveInvestments(): Promise<Investment[]> {
    const result = await query(
      `SELECT * FROM investments
       WHERE status = 'active'
       ORDER BY id ASC`
    );
    return result.rows;
  }

  /**
   * Get investment statistics for user
   */
  static async getUserStats(userId: number) {
    const result = await query(
      `SELECT
         COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
         COUNT(CASE WHEN status = 'unlocked' THEN 1 END) as unlocked_count,
         COUNT(CASE WHEN status = 'withdrawn' THEN 1 END) as withdrawn_count,
         COALESCE(SUM(CASE WHEN status = 'active' THEN current_value ELSE 0 END), 0) as active_value,
         COALESCE(SUM(CASE WHEN status = 'unlocked' THEN current_value ELSE 0 END), 0) as unlocked_value,
         COALESCE(SUM(CASE WHEN status = 'active' THEN yield_earned ELSE 0 END), 0) as active_yield,
         COALESCE(SUM(CASE WHEN status = 'unlocked' THEN yield_earned ELSE 0 END), 0) as unlocked_yield
       FROM investments
       WHERE user_id = $1`,
      [userId]
    );

    const stats = result.rows[0];

    // Map to frontend-expected field names and calculate totals
    return {
      activeCount: parseInt(stats.active_count),
      unlockedCount: parseInt(stats.unlocked_count),
      withdrawnCount: parseInt(stats.withdrawn_count),
      totalInvested: (parseInt(stats.active_count) + parseInt(stats.unlocked_count)) * 100,
      totalValue: parseFloat(stats.active_value) + parseFloat(stats.unlocked_value),
      totalYield: parseFloat(stats.active_yield) + parseFloat(stats.unlocked_yield),
      activeValue: parseFloat(stats.active_value),
      unlockedValue: parseFloat(stats.unlocked_value),
    };
  }
}
