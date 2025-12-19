import { UserModel } from '../models/User.js';
import { InvestmentModel } from '../models/Investment.js';
import { query } from '../config/database.js';

export class InvestmentService {
  /**
   * Create STARTER investment (50 USDT, one-time)
   */
  static async createStarterInvestment(walletAddress: string): Promise<any> {
    try {
      const user = await UserModel.findByWallet(walletAddress);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      const totalAvailable = user.available_balance + user.referral_balance;
      if (totalAvailable < 50) {
        return {
          success: false,
          message: `Insufficient balance. You have ${totalAvailable.toFixed(2)} USDT but need 50 USDT for starter`,
        };
      }

      // Deduct 50 USDT and mark starter as used
      const updatedUser = await UserModel.createStarterInvestment(user.id);

      // Create starter investment
      const investment = await InvestmentModel.createStarter(user.id);

      console.log(`🌱 Starter investment created for ${walletAddress}`);

      return {
        success: true,
        message: 'Starter investment created successfully',
        investment,
        user: updatedUser,
      };
    } catch (error) {
      console.error('Error creating starter investment:', error);
      throw error;
    }
  }

  /**
   * Create PREMIUM investment (100 USDT, tiered)
   */
  static async createPremiumInvestment(walletAddress: string): Promise<any> {
    try {
      const user = await UserModel.findByWallet(walletAddress);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      const totalAvailable = user.available_balance + user.referral_balance;
      if (totalAvailable < 100) {
        return {
          success: false,
          message: `Insufficient balance. You have ${totalAvailable.toFixed(2)} USDT but need 100 USDT for premium`,
        };
      }

      // Create investment at the appropriate tier
      const premiumCount = user.premium_count;
      const dailyPercentage = InvestmentModel.getPremiumDailyPercentage(premiumCount);

      // Deduct 100 USDT and increment premium_count
      const updatedUser = await UserModel.createPremiumInvestment(user.id);

      // Create premium investment with correct tier
      const investment = await InvestmentModel.createPremium(user.id, premiumCount);

      console.log(`💎 Premium #${premiumCount + 1} created for ${walletAddress} at ${dailyPercentage}%`);

      return {
        success: true,
        message: `Premium investment #${premiumCount + 1} created successfully at ${dailyPercentage}% daily`,
        investment,
        user: updatedUser,
      };
    } catch (error) {
      console.error('Error creating premium investment:', error);
      throw error;
    }
  }

  /**
   * Create new investment (100 USDT)
   * Requires user to have at least 100 USDT in available + referral balance
   */
  static async createInvestment(walletAddress: string): Promise<any> {
    try {
      // Get user
      const user = await UserModel.findByWallet(walletAddress);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      // Check if user has enough balance
      const totalAvailable = user.available_balance + user.referral_balance;
      if (totalAvailable < 100) {
        return {
          success: false,
          message: `Insufficient balance. You have ${totalAvailable.toFixed(2)} USDT but need 100 USDT to invest`,
        };
      }

      // Deduct 100 USDT from user balances
      const updatedUser = await UserModel.createInvestment(user.id);

      // Create investment
      const investment = await InvestmentModel.create(user.id);

      console.log(`💎 Investment created for ${walletAddress}`);

      return {
        success: true,
        message: 'Investment created successfully',
        investment,
        user: updatedUser,
      };
    } catch (error) {
      console.error('Error creating investment:', error);
      throw error;
    }
  }

  /**
   * Reinvest from unlocked investment
   * Takes 100 USDT from unlocked investment, locks the rest as profits
   */
  static async reinvest(walletAddress: string, investmentId: number): Promise<any> {
    try {
      const user = await UserModel.findByWallet(walletAddress);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      // Get investment
      const investment = await InvestmentModel.getById(investmentId);
      if (!investment) {
        return {
          success: false,
          message: 'Investment not found',
        };
      }

      if (investment.user_id !== user.id) {
        return {
          success: false,
          message: 'Investment does not belong to this user',
        };
      }

      if (investment.status !== 'unlocked') {
        return {
          success: false,
          message: 'Investment is not unlocked yet',
        };
      }

      // Check if value is at least 100
      if (investment.current_value < 100) {
        return {
          success: false,
          message: 'Investment value is less than 100 USDT',
        };
      }

      // Check referral requirements for reinvest
      const reinvestEligibility = await UserModel.canReinvest(user.id);
      if (!reinvestEligibility.canReinvest) {
        return {
          success: false,
          message: `To reinvest, you need at least 2 direct referrals (L1) with active Premium staking. You currently have ${reinvestEligibility.level1Count}/2.`,
        };
      }

      // Calculate locked profits
      const lockedProfit = investment.current_value - 100;

      // Mark old investment as withdrawn
      await InvestmentModel.markAsWithdrawn(investmentId);

      // Add locked profit to user
      await UserModel.addLockedProfits(user.id, lockedProfit);

      // Get current premium_count to determine tier
      const currentPremiumCount = user.premium_count;

      // Increment premium_count (no balance deduction for reinvest)
      await query(
        `UPDATE users SET premium_count = premium_count + 1 WHERE id = $1`,
        [user.id]
      );

      // Create new premium investment with correct tier
      const newInvestment = await InvestmentModel.createPremium(user.id, currentPremiumCount);

      console.log(`🔁 Reinvestment: ${walletAddress}`);
      console.log(`   Locked: ${lockedProfit.toFixed(2)} USDT`);
      console.log(`   New Premium Investment: 100 USDT at tier ${currentPremiumCount + 1}`);

      return {
        success: true,
        message: 'Reinvestment successful',
        lockedProfit,
        newInvestment,
      };
    } catch (error) {
      console.error('Error reinvesting:', error);
      throw error;
    }
  }

  /**
   * Get user's investments summary
   */
  static async getUserInvestments(walletAddress: string): Promise<any> {
    try {
      const user = await UserModel.findByWallet(walletAddress);
      if (!user) {
        return null;
      }

      const investments = await InvestmentModel.getUserInvestments(user.id);
      const stats = await InvestmentModel.getUserStats(user.id);
      const totalAvailable = Number(user.available_balance) + Number(user.referral_balance);
      const activeReferralCounts = await UserModel.getActiveReferralCounts(user.id);

      return {
        user,
        investments,
        stats,
        summary: {
          totalAvailable,
          canInvest: totalAvailable >= 100,
          lockedProfits: Number(user.locked_profits),
        },
        stakingEligibility: {
          hasUsedStarter: user.has_used_starter,
          premiumCount: user.premium_count,
          nextPremiumPercentage: UserModel.getNextPremiumPercentage(user.premium_count),
        },
        activeReferralCounts,
      };
    } catch (error) {
      console.error('Error getting user investments:', error);
      throw error;
    }
  }

  /**
   * Calculate days remaining for investment to unlock
   */
  static calculateDaysRemaining(investment: any): number {
    if (investment.status !== 'active') return 0;

    const currentYield = investment.yield_earned;
    const goalYield = investment.yield_goal;
    const dailyPercentage = investment.daily_percentage / 100;

    // Using compound interest formula
    // goal = current_value * (1 + rate)^days
    // Solve for days
    const currentValue = investment.current_value;
    const targetValue = investment.amount + goalYield;

    const ratio = targetValue / currentValue;
    const days = Math.log(ratio) / Math.log(1 + dailyPercentage);

    return Math.ceil(days);
  }

  /**
   * Calculate estimated completion date
   */
  static calculateEstimatedCompletion(investment: any): Date {
    const daysRemaining = this.calculateDaysRemaining(investment);
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysRemaining);
    return completionDate;
  }
}
