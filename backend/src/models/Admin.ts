import { query } from "../config/database.js";

export interface AdminWallet {
  id: number;
  wallet_address: string;
  name?: string;
  created_at: Date;
  is_active: boolean;
}

export class AdminModel {
  static async isAdmin(walletAddress: string): Promise<boolean> {
    const result = await query(
      `SELECT id FROM admin_wallets WHERE LOWER(wallet_address) = LOWER($1) AND is_active = true`,
      [walletAddress]
    );
    return result.rows.length > 0;
  }

  static async getByWallet(walletAddress: string): Promise<AdminWallet | null> {
    const result = await query(
      `SELECT * FROM admin_wallets WHERE LOWER(wallet_address) = LOWER($1) AND is_active = true`,
      [walletAddress]
    );
    return result.rows[0] || null;
  }

  static async addAdmin(walletAddress: string, name?: string): Promise<AdminWallet> {
    const result = await query(
      `INSERT INTO admin_wallets (wallet_address, name) VALUES ($1, $2) ON CONFLICT (wallet_address) DO UPDATE SET is_active = true RETURNING *`,
      [walletAddress, name]
    );
    console.log(`✅ Admin wallet added: ${walletAddress}`);
    return result.rows[0];
  }

  static async removeAdmin(walletAddress: string): Promise<void> {
    await query(`UPDATE admin_wallets SET is_active = false WHERE LOWER(wallet_address) = LOWER($1)`, [walletAddress]);
    console.log(`❌ Admin wallet removed: ${walletAddress}`);
  }

  static async getAllAdmins(): Promise<AdminWallet[]> {
    const result = await query(`SELECT * FROM admin_wallets WHERE is_active = true ORDER BY created_at DESC`);
    return result.rows;
  }
}
