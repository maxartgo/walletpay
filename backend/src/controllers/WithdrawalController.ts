import { Request, Response } from 'express';
import { WithdrawalService } from '../services/WithdrawalService.js';

export class WithdrawalController {
  // Get withdrawable amount
  static async getWithdrawableAmount(req: Request, res: Response) {
    try {
      const { wallet } = req.params;

      if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
        return res.status(400).json({ error: 'Invalid wallet address' });
      }

      const result = await WithdrawalService.getWithdrawableAmount(wallet);

      if (!result) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ success: true, ...result });
    } catch (error) {
      console.error('Error getting withdrawable amount:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create withdrawal
  static async createWithdrawal(req: Request, res: Response) {
    try {
      const { walletAddress } = req.body;

      if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        return res.status(400).json({ error: 'Invalid wallet address' });
      }

      const result = await WithdrawalService.createWithdrawal(walletAddress);

      if (!result.success) {
        return res.status(400).json({ error: result.message });
      }

      res.json(result);
    } catch (error) {
      console.error('Error creating withdrawal:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get user withdrawals
  static async getUserWithdrawals(req: Request, res: Response) {
    try {
      const { wallet } = req.params;

      if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
        return res.status(400).json({ error: 'Invalid wallet address' });
      }

      const result = await WithdrawalService.getUserWithdrawals(wallet);

      if (!result) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ success: true, ...result });
    } catch (error) {
      console.error('Error getting user withdrawals:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get referral withdrawable amount
  static async getReferralWithdrawableAmount(req: Request, res: Response) {
    try {
      const { wallet } = req.params;

      if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
        return res.status(400).json({ error: 'Invalid wallet address' });
      }

      const result = await WithdrawalService.getReferralWithdrawableAmount(wallet);

      if (!result) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ success: true, ...result });
    } catch (error) {
      console.error('Error getting referral withdrawable amount:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create referral withdrawal
  static async createReferralWithdrawal(req: Request, res: Response) {
    try {
      const { walletAddress } = req.body;

      if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        return res.status(400).json({ error: 'Invalid wallet address' });
      }

      const result = await WithdrawalService.createReferralWithdrawal(walletAddress);

      if (!result.success) {
        return res.status(400).json({ error: result.message });
      }

      res.json(result);
    } catch (error) {
      console.error('Error creating referral withdrawal:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
