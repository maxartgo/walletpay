import { Request, Response } from 'express';
import { AdminModel } from '../models/Admin.js';
import { WithdrawalModel } from '../models/Withdrawal.js';
import { UserModel } from '../models/User.js';

export class AdminController {
  /**
   * Verify admin wallet and login
   */
  static async login(req: Request, res: Response) {
    try {
      const { walletAddress } = req.body;

      if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        return res.status(400).json({ error: 'Invalid wallet address' });
      }

      const isAdmin = await AdminModel.isAdmin(walletAddress);
      
      if (!isAdmin) {
        return res.status(403).json({ error: 'Unauthorized - not an admin wallet' });
      }

      const admin = await AdminModel.getByWallet(walletAddress);
      
      res.json({ 
        success: true, 
        admin,
        message: 'Admin authenticated successfully'
      });
    } catch (error) {
      console.error('Error in admin login:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get all withdrawals with filters
   */
  static async getWithdrawals(req: Request, res: Response) {
    try {
      const { status } = req.query;
      
      const withdrawals = await WithdrawalModel.getAllWithdrawals(status as string);
      
      res.json({ 
        success: true, 
        withdrawals 
      });
    } catch (error) {
      console.error('Error getting withdrawals:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Approve withdrawal
   */
  static async approveWithdrawal(req: Request, res: Response) {
    try {
      const { withdrawalId, txHash } = req.body;

      if (!withdrawalId || !txHash) {
        return res.status(400).json({ error: 'Missing withdrawalId or txHash' });
      }

      const withdrawal = await WithdrawalModel.approve(withdrawalId, txHash);
      
      res.json({ 
        success: true, 
        withdrawal,
        message: 'Withdrawal approved successfully'
      });
    } catch (error: any) {
      console.error('Error approving withdrawal:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Reject withdrawal and refund user
   */
  static async rejectWithdrawal(req: Request, res: Response) {
    try {
      const { withdrawalId } = req.body;

      if (!withdrawalId) {
        return res.status(400).json({ error: 'Missing withdrawalId' });
      }

      const withdrawal = await WithdrawalModel.getById(withdrawalId);
      if (!withdrawal) {
        return res.status(404).json({ error: 'Withdrawal not found' });
      }

      // Reject the withdrawal
      const rejectedWithdrawal = await WithdrawalModel.reject(withdrawalId);

      // Refund the user (restore balances based on withdrawal type)
      // Note: We need to determine if this was a personal or referral withdrawal
      // For now, we'll refund to available_balance
      await UserModel.refundWithdrawal(withdrawal.user_id, Number(withdrawal.gross_amount));
      
      res.json({ 
        success: true, 
        withdrawal: rejectedWithdrawal,
        message: 'Withdrawal rejected and user refunded'
      });
    } catch (error: any) {
      console.error('Error rejecting withdrawal:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Get all active users
   */
  static async getUsers(req: Request, res: Response) {
    try {
      const users = await UserModel.getAllUsers();
      
      res.json({ 
        success: true, 
        users 
      });
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get platform statistics
   */
  static async getStats(req: Request, res: Response) {
    try {
      const withdrawalStats = await WithdrawalModel.getStats();
      const userCount = await UserModel.getTotalUsers();
      
      res.json({ 
        success: true, 
        stats: {
          withdrawals: withdrawalStats,
          totalUsers: userCount
        }
      });
    } catch (error) {
      console.error('Error getting stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
