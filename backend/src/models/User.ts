import { query } from '../config/database.js';
import { InvestmentModel } from './Investment.js';

export interface User {
  id: number;
  wallet_address: string;
  referrer_address?: string;
  total_deposited: number;
  total_referral_earned: number;
  available_balance: number;
  referral_balance: number;
  locked_profits: number;
  total_withdrawn: number;
  direct_referrals: number;
  level2_referrals: number;
  level3_referrals: number;
  level4_referrals: number;
  level5_referrals: number;
  has_used_starter: boolean;
  premium_count: number;
  created_at: Date;
  updated_at: Date;
}

export class UserModel {
  /**
   * Find user by wallet address
   */
  static async findByWallet(walletAddress: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE LOWER(wallet_address) = LOWER($1)',
      [walletAddress]
    );
    return result.rows[0] || null;
  }

  /**
   * Find user by ID
   */
  static async findById(userId: number): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0] || null;
  }

  /**
   * Create new user
   */
  static async create(walletAddress: string, referrerAddress?: string): Promise<User> {
    const result = await query(
      `INSERT INTO users (wallet_address, referrer_address)
       VALUES ($1, $2)
       RETURNING *`,
      [walletAddress, referrerAddress || null]
    );

    console.log(`👤 New user created: ${walletAddress}`);
    return result.rows[0];
  }

  /**
   * Add deposit to available balance
   */
  static async addDeposit(userId: number, amount: number): Promise<User> {
    const result = await query(
      `UPDATE users
       SET total_deposited = total_deposited + $1,
           available_balance = available_balance + $1
       WHERE id = $2
       RETURNING *`,
      [amount, userId]
    );

    console.log(`💰 Deposit added: ${amount} USDT → available_balance`);
    return result.rows[0];
  }

  /**
   * Add referral earning
   */
  static async addReferralEarning(userId: number, amount: number, level: number): Promise<User> {
    const columnMap: { [key: number]: string } = {
      1: 'direct_referrals',
      2: 'level2_referrals',
      3: 'level3_referrals',
      4: 'level4_referrals',
      5: 'level5_referrals',
    };

    const columnName = columnMap[level];
    if (!columnName) {
      throw new Error(`Invalid referral level: ${level}`);
    }

    // Costruisci la query in modo sicuro
    const sql = `UPDATE users
       SET total_referral_earned = total_referral_earned + $1,
           referral_balance = referral_balance + $1,
           ${columnName} = ${columnName} + 1
       WHERE id = $2
       RETURNING *`;

    const result = await query(sql, [amount, userId]);

    console.log(`🤝 Referral earning: Level ${level}, ${amount} USDT`);
    return result.rows[0];
  }

  /**
   * Create investment from available funds (100 USDT)
   */
  static async createInvestment(userId: number): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const totalAvailable = user.available_balance + user.referral_balance;
    if (totalAvailable < 100) {
      throw new Error('Insufficient balance for investment');
    }

    // Deduct 100 USDT from balances (referral first, then available)
    let remaining = 100;
    let newReferralBalance = user.referral_balance;
    let newAvailableBalance = user.available_balance;

    if (newReferralBalance >= remaining) {
      newReferralBalance -= remaining;
    } else {
      remaining -= newReferralBalance;
      newReferralBalance = 0;
      newAvailableBalance -= remaining;
    }

    const result = await query(
      `UPDATE users
       SET available_balance = $1,
           referral_balance = $2
       WHERE id = $3
       RETURNING *`,
      [newAvailableBalance, newReferralBalance, userId]
    );

    console.log(`🚀 Investment created: -100 USDT from balances`);
    return result.rows[0];
  }

  /**
   * Add locked profits (from reinvestments)
   */
  static async addLockedProfits(userId: number, amount: number): Promise<User> {
    const result = await query(
      `UPDATE users
       SET locked_profits = locked_profits + $1
       WHERE id = $2
       RETURNING *`,
      [amount, userId]
    );

    console.log(`🔒 Locked profits: +${amount} USDT`);
    return result.rows[0];
  }

  /**
   * Process withdrawal (reset all balances)
   */
  static async processWithdrawal(userId: number, amount: number): Promise<User> {
    const result = await query(
      `UPDATE users
       SET available_balance = 0,
           referral_balance = 0,
           locked_profits = 0,
           total_withdrawn = total_withdrawn + $1
       WHERE id = $2
       RETURNING *`,
      [amount, userId]
    );

    console.log(`💸 Withdrawal processed: ${amount} USDT (net after tax)`);
    return result.rows[0];
  }

  /**
   * Process REFERRAL withdrawal (reset only referral balance)
   */
  static async processReferralWithdrawal(userId: number, amount: number): Promise<User> {
    const result = await query(
      `UPDATE users
       SET referral_balance = 0,
           total_withdrawn = total_withdrawn + $1
       WHERE id = $2
       RETURNING *`,
      [amount, userId]
    );

    console.log(`💰 Referral withdrawal processed: ${amount} USDT (net after tax)`);
    return result.rows[0];
  }

  /**
   * Get referral chain (up to 5 levels)
   */
  static async getReferralChain(walletAddress: string, maxLevel: number = 5): Promise<User[]> {
    const chain: User[] = [];
    let currentWallet = walletAddress;

    for (let i = 0; i < maxLevel; i++) {
      const user = await this.findByWallet(currentWallet);
      if (!user || !user.referrer_address) break;

      const referrer = await this.findByWallet(user.referrer_address);
      if (!referrer) break;

      chain.push(referrer);
      currentWallet = referrer.wallet_address;
    }

    return chain;
  }

  /**
   * Get all users
   */
  static async getAllUsers(): Promise<User[]> {
    const result = await query('SELECT * FROM users ORDER BY created_at DESC');
    return result.rows;
  }

  /**
   * Get total available for investment
   */
  static async getTotalAvailable(userId: number): Promise<number> {
    const user = await this.findById(userId);
    if (!user) return 0;

    return user.available_balance + user.referral_balance;
  }

  /**
   * Get user statistics
   */
  static async getUserStats(userId: number) {
    const user = await this.findById(userId);
    if (!user) return null;

    const totalAvailable = user.available_balance + user.referral_balance;
    const canInvest = totalAvailable >= 100;

    return {
      user,
      totalAvailable,
      canInvest,
      referralStats: {
        total: user.total_referral_earned,
        level1: user.direct_referrals,
        level2: user.level2_referrals,
        level3: user.level3_referrals,
        level4: user.level4_referrals,
        level5: user.level5_referrals,
      },
    };
  }

  /**
   * Refund withdrawal (admin rejected withdrawal)
   */
  static async refundWithdrawal(userId: number, amount: number): Promise<User> {
    const result = await query(
      `UPDATE users
       SET available_balance = available_balance + $1
       WHERE id = $2
       RETURNING *`,
      [amount, userId]
    );

    console.log(`💰 Refunded ${amount} USDT to user ${userId}`);
    return result.rows[0];
  }

  /**
   * Get total users count
   */
  static async getTotalUsers(): Promise<number> {
    const result = await query('SELECT COUNT(*) as count FROM users');
    return parseInt(result.rows[0].count);
  }

  /**
   * Create STARTER investment (50 USDT, unlimited)
   */
  static async createStarterInvestment(userId: number): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const totalAvailable = user.available_balance + user.referral_balance;
    if (totalAvailable < 50) {
      throw new Error('Insufficient balance for starter investment (minimum 50 USDT)');
    }

    // Deduct 50 USDT from balances (referral first, then available)
    let remaining = 50;
    let newReferralBalance = user.referral_balance;
    let newAvailableBalance = user.available_balance;

    if (newReferralBalance >= remaining) {
      newReferralBalance -= remaining;
    } else {
      remaining -= newReferralBalance;
      newReferralBalance = 0;
      newAvailableBalance -= remaining;
    }

    const result = await query(
      `UPDATE users
       SET available_balance = $1,
           referral_balance = $2
       WHERE id = $3
       RETURNING *`,
      [newAvailableBalance, newReferralBalance, userId]
    );

    console.log(`🌱 Starter investment created: -50 USDT from balances`);
    return result.rows[0];
  }

  /**
   * Create PREMIUM investment (100 USDT, tiered)
   */
  static async createPremiumInvestment(userId: number): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const totalAvailable = user.available_balance + user.referral_balance;
    if (totalAvailable < 100) {
      throw new Error('Insufficient balance for premium investment (minimum 100 USDT)');
    }

    // Deduct 100 USDT from balances (referral first, then available)
    let remaining = 100;
    let newReferralBalance = user.referral_balance;
    let newAvailableBalance = user.available_balance;

    if (newReferralBalance >= remaining) {
      newReferralBalance -= remaining;
    } else {
      remaining -= newReferralBalance;
      newReferralBalance = 0;
      newAvailableBalance -= remaining;
    }

    const result = await query(
      `UPDATE users
       SET available_balance = $1,
           referral_balance = $2,
           premium_count = premium_count + 1
       WHERE id = $3
       RETURNING *`,
      [newAvailableBalance, newReferralBalance, userId]
    );

    console.log(`💎 Premium investment created: -100 USDT from balances, premium_count now ${user.premium_count + 1}`);
    return result.rows[0];
  }

  /**
   * Get next premium percentage for user
   */
  static getNextPremiumPercentage(premiumCount: number): number {
    return InvestmentModel.getPremiumDailyPercentage(premiumCount);
  }

  /**
   * Count active referrals with Premium staking at a specific level
   */
  static async countActiveReferralsWithPremium(userId: number, level: number): Promise<number> {
    const result = await query(
      `SELECT COUNT(DISTINCT u.id) as count
       FROM users u
       INNER JOIN investments i ON i.user_id = u.id
       WHERE u.id IN (
         WITH RECURSIVE referral_tree AS (
           SELECT id, wallet_address, referrer_address, 1 as depth
           FROM users
           WHERE referrer_address = (SELECT wallet_address FROM users WHERE id = $1)

           UNION ALL

           SELECT u.id, u.wallet_address, u.referrer_address, rt.depth + 1
           FROM users u
           INNER JOIN referral_tree rt ON u.referrer_address = rt.wallet_address
           WHERE rt.depth < $2
         )
         SELECT id FROM referral_tree WHERE depth = $2
       )
       AND i.staking_type = 'premium'
       AND i.status = 'active'`,
      [userId, level]
    );

    return parseInt(result.rows[0].count);
  }

  /**
   * Check if user meets requirements for reinvest
   * Requires: 2 L1 referrals with active Premium
   */
  static async canReinvest(userId: number): Promise<{ canReinvest: boolean; level1Count: number }> {
    const level1Count = await this.countActiveReferralsWithPremium(userId, 1);

    return {
      canReinvest: level1Count >= 2,
      level1Count,
    };
  }

  /**
   * Check if user meets requirements for withdrawal
   * Requires: 2 L1 + 4 L2 referrals with active Premium
   */
  static async canWithdraw(userId: number): Promise<{
    canWithdraw: boolean;
    level1Count: number;
    level2Count: number;
  }> {
    const level1Count = await this.countActiveReferralsWithPremium(userId, 1);
    const level2Count = await this.countActiveReferralsWithPremium(userId, 2);

    return {
      canWithdraw: level1Count >= 2 && level2Count >= 4,
      level1Count,
      level2Count,
    };
  }
  /**
   * Get active Premium counts for all referral levels (1-5)
   */
  static async getActiveReferralCounts(userId: number): Promise<{
    level1Active: number;
    level2Active: number;
    level3Active: number;
    level4Active: number;
    level5Active: number;
  }> {
    const [level1, level2, level3, level4, level5] = await Promise.all([
      this.countActiveReferralsWithPremium(userId, 1),
      this.countActiveReferralsWithPremium(userId, 2),
      this.countActiveReferralsWithPremium(userId, 3),
      this.countActiveReferralsWithPremium(userId, 4),
      this.countActiveReferralsWithPremium(userId, 5),
    ]);

    return {
      level1Active: level1,
      level2Active: level2,
      level3Active: level3,
      level4Active: level4,
      level5Active: level5,
    };
  }
}
