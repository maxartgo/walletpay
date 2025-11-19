import { Request, Response } from 'express';
import { DepositService } from '../services/DepositService.js';
import { DepositModel } from '../models/Deposit.js';

export class DepositController {
  static async createDeposit(req: Request, res: Response) {
    try {
      const { walletAddress, amount, txHash, blockNumber, referrerAddress } = req.body;

      // Validation
      if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        return res.status(400).json({ error: 'Invalid wallet address' });
      }

      if (!txHash || !/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
        return res.status(400).json({ error: 'Invalid transaction hash' });
      }

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }

      if (!blockNumber || blockNumber <= 0) {
        return res.status(400).json({ error: 'Invalid block number' });
      }

      if (referrerAddress && !/^0x[a-fA-F0-9]{40}$/.test(referrerAddress)) {
        return res.status(400).json({ error: 'Invalid referrer address' });
      }

      // Process deposit
      const result = await DepositService.processDeposit(
        walletAddress,
        amount,
        txHash,
        blockNumber,
        referrerAddress
      );

      res.json(result);
    } catch (error) {
      console.error('Error creating deposit:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getUserDeposits(req: Request, res: Response) {
    try {
      const { wallet } = req.params;

      if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
        return res.status(400).json({ error: 'Invalid wallet address' });
      }

      const result = await DepositService.getUserDeposits(wallet);

      if (!result) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ success: true, ...result });
    } catch (error) {
      console.error('Error getting user deposits:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getAllDeposits(req: Request, res: Response) {
    try {
      const deposits = await DepositModel.getAllDeposits();
      res.json({ success: true, deposits });
    } catch (error) {
      console.error('Error getting all deposits:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
