import { UserModel } from '../models/User.js';
import { InvestmentModel } from '../models/Investment.js';
import { WithdrawalModel } from '../models/Withdrawal.js';

export class WithdrawalService {
  /**
   * Calculate withdrawable amount for PERSONAL funds (excluding referral)
   */
  static async getWithdrawableAmount(walletAddress: string): Promise<any> {
    try {
      const user = await UserModel.findByWallet(walletAddress);
      if (!user) {
        return null;
      }

      // Get unlocked investments
      const unlockedValue = await InvestmentModel.getTotalUnlockedValue(user.id);

      // Personal funds = available + locked_profits + unlocked investments (NO REFERRAL)
      // Convert string values to numbers (PostgreSQL returns DECIMAL as strings)
      const grossAmount =
        Number(user.available_balance) +
        Number(user.locked_profits) +
        Number(unlockedValue);

      // Calculate 12% tax
      const taxPercentage = 12;
      const taxAmount = grossAmount * (taxPercentage / 100);
      const netAmount = grossAmount - taxAmount;

      return {
        user,
        breakdown: {
          availableBalance: user.available_balance,
          lockedProfits: user.locked_profits,
          unlockedInvestments: unlockedValue,
        },
        grossAmount,
        taxPercentage,
        taxAmount,
        netAmount,
        canWithdraw: grossAmount > 0,
      };
    } catch (error) {
      console.error('Error calculating withdrawable amount:', error);
      throw error;
    }
  }

  /**
   * Calculate withdrawable amount for REFERRAL funds only
   */
  static async getReferralWithdrawableAmount(walletAddress: string): Promise<any> {
    try {
      const user = await UserModel.findByWallet(walletAddress);
      if (!user) {
        return null;
      }

      // Referral funds only
      const grossAmount = Number(user.referral_balance);

      // Calculate 12% tax
      const taxPercentage = 12;
      const taxAmount = grossAmount * (taxPercentage / 100);
      const netAmount = grossAmount - taxAmount;

      return {
        user,
        grossAmount,
        taxPercentage,
        taxAmount,
        netAmount,
        canWithdraw: grossAmount > 0,
      };
    } catch (error) {
      console.error('Error calculating referral withdrawable amount:', error);
      throw error;
    }
  }

  /**
   * Process withdrawal request
   */
  static async createWithdrawal(walletAddress: string): Promise<any> {
    try {
      const user = await UserModel.findByWallet(walletAddress);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      // Calculate withdrawable amount
      const withdrawableData = await this.getWithdrawableAmount(walletAddress);
      if (!withdrawableData || withdrawableData.grossAmount <= 0) {
        return {
          success: false,
          message: 'No funds available to withdraw',
        };
      }

      const { grossAmount, taxAmount, netAmount } = withdrawableData;

      // Check minimum withdrawal limit (net amount after tax)
      const minimumWithdrawal = Number(process.env.MINIMUM_WITHDRAWAL_NET) || 50;
      if (netAmount < minimumWithdrawal) {
        return {
          success: false,
          message: `Minimum withdrawal amount is ${minimumWithdrawal} USDT (net). You have ${netAmount.toFixed(2)} USDT after tax.`,
          grossAmount,
          taxAmount,
          netAmount,
          minimumRequired: minimumWithdrawal,
        };
      }

      // Create withdrawal record
      const withdrawal = await WithdrawalModel.create(
        user.id,
        walletAddress,
        grossAmount
      );

      // Mark all unlocked investments as withdrawn
      const unlockedInvestments = await InvestmentModel.getUserUnlockedInvestments(user.id);
      for (const investment of unlockedInvestments) {
        await InvestmentModel.markAsWithdrawn(investment.id);
      }

      // Reset user balances
      await UserModel.processWithdrawal(user.id, netAmount);

      console.log(`💸 Withdrawal created for ${walletAddress}`);
      console.log(`   Gross: ${grossAmount.toFixed(2)} USDT`);
      console.log(`   Tax (12%): ${taxAmount.toFixed(2)} USDT`);
      console.log(`   Net: ${netAmount.toFixed(2)} USDT`);

      return {
        success: true,
        message: 'Withdrawal created successfully',
        withdrawal,
        grossAmount,
        taxAmount,
        netAmount,
      };
    } catch (error) {
      console.error('Error creating withdrawal:', error);
      throw error;
    }
  }

  /**
   * Process REFERRAL withdrawal request
   */
  static async createReferralWithdrawal(walletAddress: string): Promise<any> {
    try {
      const user = await UserModel.findByWallet(walletAddress);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      // Calculate referral withdrawable amount
      const withdrawableData = await this.getReferralWithdrawableAmount(walletAddress);
      if (!withdrawableData || withdrawableData.grossAmount <= 0) {
        return {
          success: false,
          message: 'No referral funds available to withdraw',
        };
      }

      const { grossAmount, taxAmount, netAmount } = withdrawableData;

      // Check minimum withdrawal limit (net amount after tax)
      const minimumWithdrawal = Number(process.env.MINIMUM_WITHDRAWAL_NET) || 50;
      if (netAmount < minimumWithdrawal) {
        return {
          success: false,
          message: `Minimum referral withdrawal amount is ${minimumWithdrawal} USDT (net). You have ${netAmount.toFixed(2)} USDT after tax.`,
          grossAmount,
          taxAmount,
          netAmount,
          minimumRequired: minimumWithdrawal,
        };
      }

      // Create withdrawal record
      const withdrawal = await WithdrawalModel.create(
        user.id,
        walletAddress,
        grossAmount
      );

      // Reset ONLY referral balance (not available_balance or locked_profits)
      await UserModel.processReferralWithdrawal(user.id, netAmount);

      console.log(`💰 Referral Withdrawal created for ${walletAddress}`);
      console.log(`   Gross: ${grossAmount.toFixed(2)} USDT`);
      console.log(`   Tax (12%): ${taxAmount.toFixed(2)} USDT`);
      console.log(`   Net: ${netAmount.toFixed(2)} USDT`);

      return {
        success: true,
        message: 'Referral withdrawal created successfully',
        withdrawal,
        grossAmount,
        taxAmount,
        netAmount,
      };
    } catch (error) {
      console.error('Error creating referral withdrawal:', error);
      throw error;
    }
  }

  /**
   * Complete withdrawal (after blockchain transaction)
   */
  static async completeWithdrawal(withdrawalId: number, txHash: string): Promise<any> {
    try {
      const withdrawal = await WithdrawalModel.markCompleted(withdrawalId, txHash);

      console.log(`✅ Withdrawal ${withdrawalId} completed`);
      console.log(`   TX: ${txHash}`);

      return {
        success: true,
        message: 'Withdrawal completed',
        withdrawal,
      };
    } catch (error) {
      console.error('Error completing withdrawal:', error);
      throw error;
    }
  }

  /**
   * Fail withdrawal
   */
  static async failWithdrawal(withdrawalId: number): Promise<any> {
    try {
      const withdrawal = await WithdrawalModel.markFailed(withdrawalId);

      console.log(`❌ Withdrawal ${withdrawalId} failed`);

      // TODO: Restore user balances if withdrawal fails

      return {
        success: true,
        message: 'Withdrawal marked as failed',
        withdrawal,
      };
    } catch (error) {
      console.error('Error failing withdrawal:', error);
      throw error;
    }
  }

  /**
   * Get user withdrawal history
   */
  static async getUserWithdrawals(walletAddress: string): Promise<any> {
    try {
      const user = await UserModel.findByWallet(walletAddress);
      if (!user) {
        return null;
      }

      const withdrawals = await WithdrawalModel.getUserWithdrawals(user.id);

      return {
        user,
        withdrawals,
        totalWithdrawn: await WithdrawalModel.getTotalWithdrawnByUser(user.id),
      };
    } catch (error) {
      console.error('Error getting user withdrawals:', error);
      throw error;
    }
  }
}
