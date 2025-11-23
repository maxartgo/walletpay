import { UserModel } from '../models/User.js';
import { ReferralEarningModel } from '../models/ReferralEarning.js';
import { REFERRAL_LEVELS } from '../types/index.js';

export class ReferralService {
  static async processReferralRewards(
    userWallet: string,
    depositId: number,
    depositAmount: number,
    userId: number
  ): Promise<void> {
    // Get referral chain (up to 5 levels)
    const referralChain = await UserModel.getReferralChain(userWallet, 5);

    // Process rewards for each level
    for (let i = 0; i < referralChain.length; i++) {
      const referrer = referralChain[i];
      const levelConfig = REFERRAL_LEVELS[i];

      if (!levelConfig) break;

      // Calculate reward
      const rewardAmount = (depositAmount * levelConfig.percentage) / 100;

      // Create referral earning record
      await ReferralEarningModel.create(
        referrer.id,      // referrerId
        userId,           // refereeId (the person who made the deposit)
        depositId,
        levelConfig.level,
        rewardAmount
      );

      // Update referrer's balance
      await UserModel.addReferralEarning(
        referrer.id,
        rewardAmount,
        levelConfig.level
      );

      console.log(
        `Referral reward: Level ${levelConfig.level}, ` +
        `Referrer: ${referrer.wallet_address}, ` +
        `Amount: ${rewardAmount} USDT (${levelConfig.percentage}%)`
      );
    }
  }

  static async getReferralTree(walletAddress: string) {
    const user = await UserModel.findByWallet(walletAddress);
    if (!user) return null;

    const earnings = await ReferralEarningModel.getUserEarnings(user.id);
    const earningsByLevel = await ReferralEarningModel.getTotalEarningsByLevel(user.id);

    return {
      user,
      earnings,
      earningsByLevel,
      totalReferrals: {
        level1: user.direct_referrals,
        level2: user.level2_referrals,
        level3: user.level3_referrals,
        level4: user.level4_referrals,
        level5: user.level5_referrals,
      },
    };
  }
}
