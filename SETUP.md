# Quick Setup Guide - WalletPay

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL 14+ installed and running
- [ ] MetaMask browser extension installed
- [ ] Your destination wallet address ready

## Step-by-Step Setup

### 1. Install Dependencies

```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### 2. Setup Database

```bash
# Create database (Windows - use psql in Command Prompt or PowerShell)
psql -U postgres -c "CREATE DATABASE walletpay;"

# Run schema
psql -U postgres -d walletpay -f database\schema.sql
```

**Note for Windows**: If `psql` is not in your PATH, use the full path:
```bash
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -c "CREATE DATABASE walletpay;"
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d walletpay -f database\schema.sql
```

### 3. Configure Environment Variables

#### Backend Configuration

```bash
cd backend
copy .env.example .env
```

Edit `backend\.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=walletpay
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD

PORT=3001
NODE_ENV=development

# IMPORTANT: Replace with your wallet address
DESTINATION_WALLET=0xYourWalletAddressHere

# BSC USDT Contract (Mainnet)
USDT_CONTRACT_BNB=0x55d398326f99059fF775485246999027B3197955
BNB_CHAIN_ID=56

# Goals
GLOBAL_DEPOSIT_GOAL=10000
WALLET_COUNT_GOAL=10000
DAILY_YIELD_PERCENTAGE=0.1
```

#### Frontend Configuration

```bash
# From root directory
copy .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:3001/api
VITE_DESTINATION_WALLET=0xYourWalletAddressHere
```

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
✓ Database connected successfully
🚀 WalletPay Backend Server
📡 Server running on port 3001
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

You should see:
```
VITE ready in X ms
➜  Local:   http://localhost:5173/
```

### 5. Access the Application

Open your browser and go to: http://localhost:5173

### 6. Test the Application

1. Click "Connect Wallet"
2. Approve connection in MetaMask
3. If prompted, switch to BNB Smart Chain
4. You should see your dashboard

## Common Issues

### PostgreSQL Not Running

**Windows:**
```bash
# Start PostgreSQL service
net start postgresql-x64-15
```

Or use Services app (`services.msc`) and start "postgresql-x64-15"

### Database Connection Error

Check your PostgreSQL password in `backend\.env`:
```env
DB_PASSWORD=your_actual_password
```

### Port Already in Use

If port 3001 or 5173 is in use, change it:

Backend (`backend\.env`):
```env
PORT=3002
```

Frontend (`vite.config.ts`):
```ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174
  }
})
```

### MetaMask Not Detected

- Ensure MetaMask extension is installed
- Refresh the page
- Check browser console for errors

## Testing with BSC Testnet

For testing without real money, use BSC Testnet:

1. Add BSC Testnet to MetaMask:
   - Network Name: BNB Testnet
   - RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545/
   - Chain ID: 97
   - Currency Symbol: BNB
   - Block Explorer: https://testnet.bscscan.com

2. Get test BNB: https://testnet.binance.org/faucet-smart

3. Get test USDT from a testnet faucet

4. Update `backend\.env`:
```env
BNB_CHAIN_ID=97
# Use testnet USDT contract address
```

## Verify Everything Works

1. **Backend Health Check:**
   Open: http://localhost:3001/api/health

   Should return:
   ```json
   {"status":"ok","timestamp":"..."}
   ```

2. **Global Stats:**
   Open: http://localhost:3001/api/stats/global

   Should return stats with 0 values

3. **Frontend:**
   - Should load without errors
   - Connect wallet should work
   - Stats should display

## Next Steps

1. Replace `DESTINATION_WALLET` with your actual wallet address
2. Test deposits with small amounts on testnet first
3. Monitor backend logs for any errors
4. Check database for recorded transactions

## Getting Help

If you encounter issues:

1. Check backend terminal for error messages
2. Check browser console (F12) for frontend errors
3. Verify all environment variables are set correctly
4. Ensure PostgreSQL is running
5. Make sure you're on the correct network in MetaMask

---

✅ You're ready to use WalletPay for educational testing!
