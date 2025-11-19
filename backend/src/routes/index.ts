import express from 'express';
import { UserController } from '../controllers/UserController.js';
import { DepositController } from '../controllers/DepositController.js';
import { InvestmentController } from '../controllers/InvestmentController.js';
import { StatsController } from '../controllers/StatsController.js';
import { WithdrawalController } from '../controllers/WithdrawalController.js';
import { AdminController } from '../controllers/AdminController.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// User routes
router.get('/users/:wallet', UserController.getUser);
router.get('/users/:wallet/stats', UserController.getUserStats);
router.get('/users/:wallet/referrals', UserController.getReferralTree);
router.get('/users/:wallet/yields', UserController.getYieldHistory);

// Deposit routes
router.post('/deposits', DepositController.createDeposit);
router.get('/deposits/:wallet', DepositController.getUserDeposits);

// Investment routes
router.post('/investments', InvestmentController.createInvestment);
router.post('/investments/reinvest', InvestmentController.reinvest);
router.get('/investments/:wallet', InvestmentController.getUserInvestments);

// Withdrawal routes
router.get('/withdrawals/:wallet/amount', WithdrawalController.getWithdrawableAmount);
router.post('/withdrawals', WithdrawalController.createWithdrawal);
router.get('/withdrawals/:wallet', WithdrawalController.getUserWithdrawals);

// Referral Withdrawal routes
router.get('/withdrawals/:wallet/referral/amount', WithdrawalController.getReferralWithdrawableAmount);
router.post('/withdrawals/referral', WithdrawalController.createReferralWithdrawal);

// Stats routes
router.get('/stats/global', StatsController.getGlobalStats);

// Admin routes
router.post('/admin/login', AdminController.login);
router.get('/admin/withdrawals', AdminController.getWithdrawals);
router.post('/admin/withdrawals/approve', AdminController.approveWithdrawal);
router.post('/admin/withdrawals/reject', AdminController.rejectWithdrawal);
router.get('/admin/users', AdminController.getUsers);
router.get('/admin/stats', AdminController.getStats);

export default router;
