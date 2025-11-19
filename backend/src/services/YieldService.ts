import { InvestmentModel } from '../models/Investment.js';

export class YieldService {
  /**
   * Calculate daily yields for all active investments
   * Runs daily via cron job
   */
  static async calculateDailyYields(): Promise<void> {
    console.log('\n' + '='.repeat(50));
    console.log('💰 DAILY YIELD CALCULATION STARTED');
    console.log('='.repeat(50));
    console.log(`⏰ Time: ${new Date().toISOString()}`);

    try {
      // Get all active investments
      const activeInvestments = await InvestmentModel.getAllActiveInvestments();

      if (activeInvestments.length === 0) {
        console.log('ℹ️  No active investments found');
        console.log('='.repeat(50) + '\n');
        return;
      }

      console.log(`📊 Processing ${activeInvestments.length} active investments\n`);

      let unlockedCount = 0;
      let stillActiveCount = 0;

      // Apply daily yield to each investment
      for (const investment of activeInvestments) {
        try {
          const updatedInvestment = await InvestmentModel.applyDailyYield(investment.id);

          const yieldAdded = updatedInvestment.current_value - investment.current_value;
          const progress = (updatedInvestment.yield_earned / updatedInvestment.yield_goal) * 100;

          console.log(`📈 Investment #${investment.id}:`);
          console.log(`   Value: ${investment.current_value.toFixed(2)} → ${updatedInvestment.current_value.toFixed(2)} USDT`);
          console.log(`   Yield: +${yieldAdded.toFixed(2)} USDT (total: ${updatedInvestment.yield_earned.toFixed(2)}/${updatedInvestment.yield_goal.toFixed(2)})`);
          console.log(`   Progress: ${progress.toFixed(1)}%`);

          if (updatedInvestment.status === 'unlocked') {
            console.log(`   ✅ UNLOCKED! Ready for withdrawal/reinvestment`);
            unlockedCount++;
          } else {
            const daysRemaining = this.calculateDaysRemaining(updatedInvestment);
            console.log(`   ⏱️  Estimated: ${daysRemaining} days remaining`);
            stillActiveCount++;
          }
          console.log('');
        } catch (error) {
          console.error(`❌ Error processing investment #${investment.id}:`, error);
        }
      }

      console.log('─'.repeat(50));
      console.log('📊 SUMMARY:');
      console.log(`   Total processed: ${activeInvestments.length}`);
      console.log(`   Newly unlocked: ${unlockedCount}`);
      console.log(`   Still active: ${stillActiveCount}`);
      console.log('='.repeat(50) + '\n');

    } catch (error) {
      console.error('❌ Error in daily yield calculation:', error);
      console.log('='.repeat(50) + '\n');
      throw error;
    }
  }

  /**
   * Calculate days remaining for investment to unlock
   */
  static calculateDaysRemaining(investment: any): number {
    if (investment.status !== 'active') return 0;

    const dailyPercentage = investment.daily_percentage / 100;
    const currentValue = investment.current_value;
    const targetValue = investment.amount + investment.yield_goal;

    const ratio = targetValue / currentValue;
    const days = Math.log(ratio) / Math.log(1 + dailyPercentage);

    return Math.ceil(days);
  }

  /**
   * Get global yield statistics
   */
  static async getGlobalYieldStats() {
    try {
      const activeCount = await InvestmentModel.countActiveInvestments();
      const completedCount = await InvestmentModel.countCompletedInvestments();

      return {
        activeInvestments: activeCount,
        completedInvestments: completedCount,
        totalInvestments: activeCount + completedCount,
      };
    } catch (error) {
      console.error('Error getting global yield stats:', error);
      throw error;
    }
  }
}
