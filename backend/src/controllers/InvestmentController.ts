import { Request, Response } from 'express';
import { InvestmentService } from '../services/InvestmentService.js';

export class InvestmentController {
  // Create STARTER investment (50 USDT, one-time)
  static async createStarterInvestment(req: Request, res: Response) {
    try {
      const { walletAddress } = req.body;

      if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        return res.status(400).json({ error: 'Invalid wallet address' });
      }

      const result = await InvestmentService.createStarterInvestment(walletAddress);

      if (!result.success) {
        return res.status(400).json({ error: result.message });
      }

      res.json(result);
    } catch (error) {
      console.error('Error creating starter investment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create PREMIUM investment (100 USDT, tiered)
  static async createPremiumInvestment(req: Request, res: Response) {
    try {
      const { walletAddress } = req.body;

      if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        return res.status(400).json({ error: 'Invalid wallet address' });
      }

      const result = await InvestmentService.createPremiumInvestment(walletAddress);

      if (!result.success) {
        return res.status(400).json({ error: result.message });
      }

      res.json(result);
    } catch (error) {
      console.error('Error creating premium investment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create new investment (DEPRECATED - use createPremiumInvestment)
  static async createInvestment(req: Request, res: Response) {
    try {
      const { walletAddress } = req.body;

      if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        return res.status(400).json({ error: 'Invalid wallet address' });
      }

      const result = await InvestmentService.createInvestment(walletAddress);

      if (!result.success) {
        return res.status(400).json({ error: result.message });
      }

      res.json(result);
    } catch (error) {
      console.error('Error creating investment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Reinvest from unlocked investment
  static async reinvest(req: Request, res: Response) {
    try {
      const { walletAddress, investmentId } = req.body;

      if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        return res.status(400).json({ error: 'Invalid wallet address' });
      }

      if (!investmentId || isNaN(investmentId)) {
        return res.status(400).json({ error: 'Invalid investment ID' });
      }

      const result = await InvestmentService.reinvest(walletAddress, parseInt(investmentId));

      if (!result.success) {
        return res.status(400).json({ error: result.message });
      }

      res.json(result);
    } catch (error) {
      console.error('Error reinvesting:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get user investments
  static async getUserInvestments(req: Request, res: Response) {
    try {
      const { wallet } = req.params;

      if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
        return res.status(400).json({ error: 'Invalid wallet address' });
      }

      const result = await InvestmentService.getUserInvestments(wallet);

      if (!result) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ success: true, ...result });
    } catch (error) {
      console.error('Error getting user investments:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
