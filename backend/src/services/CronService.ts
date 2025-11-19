import cron from 'node-cron';
import { YieldService } from './YieldService.js';

export class CronService {
  static startDailyYieldCalculation() {
    // Run every day at 00:00 (midnight)
    cron.schedule('0 0 * * *', async () => {
      console.log('Starting daily yield calculation...');
      try {
        await YieldService.calculateDailyYields();
        console.log('Daily yield calculation completed successfully.');
      } catch (error) {
        console.error('Error in daily yield calculation:', error);
      }
    });

    console.log('Daily yield calculation cron job scheduled (00:00 daily)');
  }

  static async runManualYieldCalculation() {
    console.log('Running manual yield calculation...');
    try {
      await YieldService.calculateDailyYields();
      console.log('Manual yield calculation completed successfully.');
    } catch (error) {
      console.error('Error in manual yield calculation:', error);
      throw error;
    }
  }
}
