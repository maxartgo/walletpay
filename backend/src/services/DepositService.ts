import { UserModel } from '../models/User.js';
import { DepositModel } from '../models/Deposit.js';
import { GlobalStatsModel } from '../models/GlobalStats.js';
import { ReferralService } from './ReferralService.js';

export class DepositService {
  static async processDeposit(
    walletAddress: string,
    amount: number,
    txHash: string,
    blockNumber: number,
    referrerAddress?: string
  ): Promise<any> {
    try {
      // Check if deposit already exists
      const existingDeposit = await DepositModel.findByTxHash(txHash);
      if (existingDeposit) {
        return {
          success: false,
          message: 'Deposit already processed',
          deposit: existingDeposit,
        };
      }

      // Get or create user
      let user = await UserModel.findByWallet(walletAddress);
      let isNewUser = false;
      let isFirstDeposit = false;

      if (!user) {
        // Validate referrer if provided
        if (referrerAddress) {
          const referrer = await UserModel.findByWallet(referrerAddress);
          if (!referrer) {
            return {
              success: false,
              message: 'Invalid referrer address',
            };
          }
        }

        user = await UserModel.create(walletAddress, referrerAddress);
        isNewUser = true;
        isFirstDeposit = true;
        await GlobalStatsModel.incrementUsers();
      } else {
        isFirstDeposit = user.total_deposited === 0;
      }

      // Create deposit record
      const deposit = await DepositModel.create(
        user.id,
        walletAddress,
        amount,
        txHash,
        blockNumber
      );

      // Confirm deposit
      await DepositModel.confirmDeposit(txHash, blockNumber);

      // Add to user's available balance
      await UserModel.addDeposit(user.id, amount);

      // Update global stats
      await GlobalStatsModel.updateDeposit(amount, isFirstDeposit);

      console.log(`💰 Deposit added: ${amount} USDT → available_balance`);

      // Process referral rewards
      if (user.referrer_address) {
        await ReferralService.processReferralRewards(
          walletAddress,
          deposit.id,
          amount,
          user.id
        );
      }

      // Get updated user info
      const updatedUser = await UserModel.findByWallet(walletAddress);

      return {
        success: true,
        message: 'Deposit processed successfully',
        deposit,
        user: updatedUser,
        isNewUser,
        isFirstDeposit,
      };
    } catch (error) {
      console.error('Error processing deposit:', error);
      throw error;
    }
  }

  static async getUserDeposits(walletAddress: string) {
    const user = await UserModel.findByWallet(walletAddress);
    if (!user) return null;

    const deposits = await DepositModel.getUserDeposits(user.id);

    return {
      user,
      deposits,
    };
  }
}
