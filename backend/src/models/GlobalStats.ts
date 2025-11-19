import { query } from '../config/database.js';
import { GlobalStats } from '../types/index.js';

export class GlobalStatsModel {
  static async get(): Promise<GlobalStats> {
    const result = await query('SELECT * FROM global_stats LIMIT 1');
    return result.rows[0];
  }

  static async updateDeposit(amount: number, isFirstDeposit: boolean): Promise<GlobalStats> {
    const updateQuery = isFirstDeposit
      ? `UPDATE global_stats
         SET total_deposits = total_deposits + $1,
             paying_users = paying_users + 1
         RETURNING *`
      : `UPDATE global_stats
         SET total_deposits = total_deposits + $1
         RETURNING *`;

    const result = await query(updateQuery, [amount]);
    return result.rows[0];
  }

  static async incrementUsers(): Promise<GlobalStats> {
    const result = await query(
      `UPDATE global_stats
       SET total_users = total_users + 1
       RETURNING *`
    );
    return result.rows[0];
  }

  static async checkAndUnlockWithdrawals(): Promise<GlobalStats> {
    const stats = await this.get();
    const goalDeposits = parseFloat(process.env.GLOBAL_DEPOSIT_GOAL || '10000');
    const goalUsers = parseInt(process.env.WALLET_COUNT_GOAL || '10000');

    if (
      !stats.withdrawals_unlocked &&
      stats.total_deposits >= goalDeposits &&
      stats.paying_users >= goalUsers
    ) {
      const result = await query(
        `UPDATE global_stats
         SET withdrawals_unlocked = TRUE,
             unlock_date = CURRENT_TIMESTAMP
         RETURNING *`
      );
      return result.rows[0];
    }

    return stats;
  }

  static async updateLastYieldCalculation(): Promise<GlobalStats> {
    const result = await query(
      `UPDATE global_stats
       SET last_yield_calculation = CURRENT_TIMESTAMP
       RETURNING *`
    );
    return result.rows[0];
  }

  static async activateCycle(): Promise<GlobalStats> {
    const result = await query(
      `UPDATE global_stats
       SET cycle_active = TRUE,
           cycle_start_date = CURRENT_TIMESTAMP,
           cycle_number = cycle_number + 1
       RETURNING *`
    );
    return result.rows[0];
  }

  static async updateCycleStats(deposits: number, activeWallets: number): Promise<GlobalStats> {
    const result = await query(
      `UPDATE global_stats
       SET cycle_deposits = $1,
           cycle_active_wallets = $2
       RETURNING *`,
      [deposits, activeWallets]
    );
    return result.rows[0];
  }

  static async stopCycle(): Promise<GlobalStats> {
    const result = await query(
      `UPDATE global_stats
       SET cycle_active = FALSE
       RETURNING *`
    );
    return result.rows[0];
  }

  static async resetCycle(): Promise<GlobalStats> {
    const result = await query(
      `UPDATE global_stats
       SET cycle_active = FALSE,
           cycle_deposits = 0,
           cycle_active_wallets = 0,
           withdrawals_unlocked = FALSE,
           unlock_date = NULL
       RETURNING *`
    );
    return result.rows[0];
  }
}
