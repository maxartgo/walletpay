import axios from 'axios';
import type { User, GlobalStats, Deposit, Withdrawal } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // User endpoints
  async getUser(wallet: string): Promise<User | null> {
    try {
      const response = await api.get(`/users/${wallet}`);
      return response.data.user;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  },

  async getUserStats(wallet: string) {
    const response = await api.get(`/users/${wallet}/stats`);
    return response.data.stats;
  },

  async getReferralTree(wallet: string) {
    const response = await api.get(`/users/${wallet}/referrals`);
    return response.data;
  },

  async getYieldHistory(wallet: string) {
    const response = await api.get(`/users/${wallet}/yields`);
    return response.data;
  },

  // Deposit endpoints
  async createDeposit(data: {
    walletAddress: string;
    amount: number;
    txHash: string;
    blockNumber: number;
    referrerAddress?: string;
  }) {
    const response = await api.post('/deposits', data);
    return response.data;
  },

  async getUserDeposits(wallet: string): Promise<Deposit[]> {
    const response = await api.get(`/deposits/${wallet}`);
    return response.data.deposits;
  },

  async getAllDeposits(): Promise<Deposit[]> {
    const response = await api.get('/deposits');
    return response.data.deposits;
  },

  // Stats endpoints
  async getGlobalStats(): Promise<GlobalStats> {
    const response = await api.get('/stats/global');
    return response.data.stats;
  },

  async getLeaderboard(limit: number = 10) {
    const response = await api.get(`/stats/leaderboard?limit=${limit}`);
    return response.data;
  },

  // Investment endpoints
  async createStarterInvestment(walletAddress: string) {
    const response = await api.post('/investments/starter', { walletAddress });
    return response.data;
  },

  async createPremiumInvestment(walletAddress: string) {
    const response = await api.post('/investments/premium', { walletAddress });
    return response.data;
  },

  async createInvestment(walletAddress: string) {
    const response = await api.post('/investments', { walletAddress });
    return response.data;
  },

  async reinvestInvestment(walletAddress: string, investmentId: number) {
    const response = await api.post('/investments/reinvest', {
      walletAddress,
      investmentId,
    });
    return response.data;
  },

  async getUserInvestments(wallet: string) {
    const response = await api.get(`/investments/${wallet}`);
    return response.data;
  },

  // Withdrawal endpoints
  async getWithdrawableAmount(wallet: string) {
    const response = await api.get(`/withdrawals/${wallet}/amount`);
    return response.data;
  },

  async createWithdrawal(walletAddress: string) {
    const response = await api.post('/withdrawals', { walletAddress });
    return response.data;
  },

  async getUserWithdrawals(wallet: string): Promise<Withdrawal[]> {
    const response = await api.get(`/withdrawals/${wallet}`);
    return response.data.withdrawals;
  },

  // Referral Withdrawal endpoints
  async getReferralWithdrawableAmount(wallet: string) {
    const response = await api.get(`/withdrawals/${wallet}/referral/amount`);
    return response.data;
  },

  async createReferralWithdrawal(walletAddress: string) {
    const response = await api.post('/withdrawals/referral', { walletAddress });
    return response.data;
  },

  // Admin endpoints
  async adminLogin(walletAddress: string) {
    const response = await api.post('/admin/login', { walletAddress });
    return response.data;
  },

  async adminGetWithdrawals(status?: string) {
    const url = status ? `/admin/withdrawals?status=${status}` : '/admin/withdrawals';
    const response = await api.get(url);
    return response.data;
  },

  async adminApproveWithdrawal(withdrawalId: number, txHash: string) {
    const response = await api.post('/admin/withdrawals/approve', { withdrawalId, txHash });
    return response.data;
  },

  async adminRejectWithdrawal(withdrawalId: number) {
    const response = await api.post('/admin/withdrawals/reject', { withdrawalId });
    return response.data;
  },

  async adminGetUsers() {
    const response = await api.get('/admin/users');
    return response.data;
  },

  async adminGetStats() {
    const response = await api.get('/admin/stats');
    return response.data;
  },
};
