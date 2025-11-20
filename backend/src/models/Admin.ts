import { query } from "../config/database.js";

export interface AdminWallet {
  id: number;
  wallet_address: string;
  created_at: Date;
}

export class AdminModel {
  static async isAdmin(walletAddress: string): Promise<boolean> {
    const result = await query(
      `SELECT id FROM admins WHERE LOWER(wallet_address) = LOWER($1)`,
      [walletAddress]
    );
    return result.rows.length > 0;
  }

  static async getByWallet(walletAddress: string): Promise<AdminWallet | null> {
    const result = await query(
      `SELECT * FROM admins WHERE LOWER(wallet_address) = LOWER($1)`,
      [walletAddress]
    );
    return result.rows[0] || null;
  }

  static async addAdmin(walletAddress: string): Promise<AdminWallet> {
    const result = await query(
      `INSERT INTO admins (wallet_address) VALUES ($1) ON CONFLICT (wallet_address) DO NOTHING RETURNING *`,
      [walletAddress]
    );
    console.log(`✅ Admin wallet added: ${walletAddress}`);
    return result.rows[0];
  }

  static async removeAdmin(walletAddress: string): Promise<void> {
    await query(`DELETE FROM admins WHERE LOWER(wallet_address) = LOWER($1)`, [walletAddress]);
    console.log(`❌ Admin wallet removed: ${walletAddress}`);
  }

  static async getAllAdmins(): Promise<AdminWallet[]> {
    const result = await query(`SELECT * FROM admins ORDER BY created_at DESC`);
    return result.rows;
  }
}
