import { Request, Response } from 'express';
import { GlobalStatsModel } from '../models/GlobalStats.js';
import { UserModel } from '../models/User.js';

export class StatsController {
  static async getGlobalStats(req: Request, res: Response) {
    try {
      const stats = await GlobalStatsModel.get();

      const goalDeposits = parseFloat(process.env.GLOBAL_DEPOSIT_GOAL || '10000');
      const goalUsers = parseInt(process.env.WALLET_COUNT_GOAL || '10000');
      const yieldPercentage = parseFloat(process.env.DAILY_YIELD_PERCENTAGE || '0.1');

      const response = {
        success: true,
        stats: {
          ...stats,
          goals: {
            depositGoal: goalDeposits,
            userGoal: goalUsers,
            depositProgress: (stats.total_deposits / goalDeposits) * 100,
            userProgress: (stats.paying_users / goalUsers) * 100,
          },
          yieldPercentage,
        },
      };

      res.json(response);
    } catch (error) {
      console.error('Error getting global stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getLeaderboard(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const users = await UserModel.getAllUsers();

      // Sort by total deposited
      const topDepositors = users
        .sort((a, b) => b.total_deposited - a.total_deposited)
        .slice(0, limit)
        .map((u, index) => ({
          rank: index + 1,
          wallet_address: u.wallet_address,
          total_deposited: u.total_deposited,
          total_referral_earned: u.total_referral_earned,
        }));

      // Sort by referral earnings
      const topReferrers = users
        .sort((a, b) => b.total_referral_earned - a.total_referral_earned)
        .slice(0, limit)
        .map((u, index) => ({
          rank: index + 1,
          wallet_address: u.wallet_address,
          total_referral_earned: u.total_referral_earned,
          total_referrals:
            u.direct_referrals +
            u.level2_referrals +
            u.level3_referrals +
            u.level4_referrals +
            u.level5_referrals,
        }));

      res.json({
        success: true,
        topDepositors,
        topReferrers,
      });
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
