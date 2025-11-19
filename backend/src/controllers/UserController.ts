import { Request, Response } from 'express';
import { UserModel } from '../models/User.js';
import { ReferralService } from '../services/ReferralService.js';
import { YieldService } from '../services/YieldService.js';

export class UserController {
  static async getUser(req: Request, res: Response) {
    try {
      const { wallet } = req.params;

      if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
        return res.status(400).json({ error: 'Invalid wallet address' });
      }

      const user = await UserModel.findByWallet(wallet);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ success: true, user });
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getUserStats(req: Request, res: Response) {
    try {
      const { wallet } = req.params;

      if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
        return res.status(400).json({ error: 'Invalid wallet address' });
      }

      const stats = await UserModel.getUserStats(wallet);

      if (!stats) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ success: true, stats });
    } catch (error) {
      console.error('Error getting user stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getReferralTree(req: Request, res: Response) {
    try {
      const { wallet } = req.params;

      if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
        return res.status(400).json({ error: 'Invalid wallet address' });
      }

      const tree = await ReferralService.getReferralTree(wallet);

      if (!tree) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ success: true, ...tree });
    } catch (error) {
      console.error('Error getting referral tree:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getYieldHistory(req: Request, res: Response) {
    try {
      const { wallet } = req.params;

      if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
        return res.status(400).json({ error: 'Invalid wallet address' });
      }

      const history = await YieldService.getUserYieldHistory(wallet);

      if (!history) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ success: true, ...history });
    } catch (error) {
      console.error('Error getting yield history:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
