# WalletPay - Educational DeFi Platform

⚠️ **IMPORTANT: This is an educational project for learning and testing purposes only. Do NOT use with real funds in production without proper audits and legal consultation.**

## Overview

WalletPay is a decentralized finance (DeFi) educational platform built on BNB Smart Chain that demonstrates:

- Wallet connection (MetaMask, Trust Wallet)
- USDT deposits on BSC network
- Multi-level referral system (5 levels)
- Daily yield calculation (0.1% daily)
- Real-time statistics and dashboards
- PostgreSQL backend for tracking

## Features

### 🔐 Wallet Integration
- Connect with MetaMask or Trust Wallet
- Automatic network detection and switching to BSC
- Real-time balance display (BNB and USDT)

### 💰 Deposits
- Deposit USDT on BNB Smart Chain
- Transparent on-chain transactions
- Real-time tracking in database

### 🤝 Referral System (5 Levels)
- Level 1: 10% commission
- Level 2: 5% commission
- Level 3: 3% commission
- Level 4: 2% commission
- Level 5: 1% commission

### 💎 Daily Yields
- Unlocks when goals are reached:
  - 10,000 USDT total deposits
  - 10,000 paying wallets
- 0.1% daily yield on deposits
- Automatic calculation every 24 hours

### 📊 Dashboard
- Global statistics (total deposits, users, progress)
- Personal dashboard (balances, earnings, referrals)
- Real-time updates

## Tech Stack

### Frontend
- React 19 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- ethers.js (Web3 integration)
- Axios (API calls)

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL (database)
- node-cron (scheduled tasks)

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- MetaMask or Trust Wallet browser extension
- BNB for gas fees (testnet or mainnet)

## Installation

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Setup PostgreSQL Database

```bash
# Create database
createdb walletpay

# Or using psql
psql -U postgres
CREATE DATABASE walletpay;
\q

# Run database schema
psql -U postgres -d walletpay -f database/schema.sql
```

### 3. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your settings:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=walletpay
DB_USER=postgres
DB_PASSWORD=your_password

# Server
PORT=3001
NODE_ENV=development

# Blockchain - IMPORTANT: Use your own wallet!
DESTINATION_WALLET=0xYourWalletAddressHere
USDT_CONTRACT_BNB=0x55d398326f99059fF775485246999027B3197955
BNB_CHAIN_ID=56

# Goals
GLOBAL_DEPOSIT_GOAL=10000
WALLET_COUNT_GOAL=10000
DAILY_YIELD_PERCENTAGE=0.1
```

### 4. Configure Frontend

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:3001/api
VITE_DESTINATION_WALLET=0xYourWalletAddressHere
```

## Running the Application

### Start Backend

```bash
cd backend
npm run dev
```

Backend will run on http://localhost:3001

### Start Frontend

```bash
# In root directory
npm run dev
```

Frontend will run on http://localhost:5173

## Usage

1. **Connect Wallet**: Click "Connect Wallet" and approve in MetaMask
2. **Switch to BSC**: If on wrong network, click "Switch to BSC"
3. **View Dashboard**: See your balances and statistics
4. **Make Deposit**:
   - Enter amount in USDT
   - Optionally enter referrer address
   - Click "Deposit USDT"
   - Approve transaction in wallet
5. **Share Referral**: Copy your wallet address and share with others
6. **Earn Rewards**:
   - Referral commissions are instant
   - Daily yields start when goals are reached

## API Endpoints

### Users
- `GET /api/users/:wallet` - Get user info
- `GET /api/users/:wallet/stats` - Get user statistics
- `GET /api/users/:wallet/referrals` - Get referral tree
- `GET /api/users/:wallet/yields` - Get yield history

### Deposits
- `POST /api/deposits` - Create new deposit
- `GET /api/deposits/:wallet` - Get user deposits
- `GET /api/deposits` - Get all deposits

### Statistics
- `GET /api/stats/global` - Get global statistics
- `GET /api/stats/leaderboard` - Get top users

## Database Schema

### Tables
- `users` - User accounts and balances
- `deposits` - Deposit transactions
- `referral_earnings` - Referral commission records
- `daily_yields` - Daily yield records
- `global_stats` - Global platform statistics

See `database/schema.sql` for complete schema.

## Cron Jobs

### Daily Yield Calculation
- Runs every day at 00:00 (midnight)
- Calculates 0.1% yield for all users
- Only runs if withdrawals are unlocked

## Security Considerations

⚠️ **For Educational Use Only**

This project demonstrates DeFi concepts but is NOT production-ready. Before using with real funds:

1. **Smart Contract Audit**: Have contracts professionally audited
2. **Security Review**: Complete security assessment
3. **Legal Compliance**: Ensure compliance with local regulations
4. **Rate Limiting**: Add API rate limiting
5. **Input Validation**: Enhanced validation and sanitization
6. **Authentication**: Add proper auth for sensitive endpoints
7. **Encryption**: Encrypt sensitive data
8. **Error Handling**: Improve error handling and logging
9. **Testing**: Comprehensive unit and integration tests
10. **Insurance**: Consider smart contract insurance

## Testing

### BSC Testnet

For testing, use BSC Testnet:
- Chain ID: 97
- RPC: https://data-seed-prebsc-1-s1.binance.org:8545/
- Faucet: https://testnet.binance.org/faucet-smart

Get test BNB for gas fees and test USDT tokens.

## Troubleshooting

### Database Connection Failed
- Check PostgreSQL is running: `pg_isready`
- Verify credentials in `backend/.env`
- Ensure database exists: `psql -l | grep walletpay`

### Wallet Won't Connect
- Ensure MetaMask is installed and unlocked
- Check you're on a supported network
- Try refreshing the page

### Transaction Failed
- Ensure you have enough BNB for gas
- Check you have sufficient USDT balance
- Verify you're on BSC network (Chain ID: 56)

### Backend Errors
- Check backend logs
- Verify all environment variables are set
- Ensure database migrations ran successfully

## Development

### Backend Development

```bash
cd backend
npm run dev  # Auto-reload on changes
```

### Frontend Development

```bash
npm run dev  # Hot Module Replacement enabled
```

### Build for Production

```bash
# Frontend
npm run build

# Backend
cd backend
npm run build
npm start
```

## Project Structure

```
walletpay/
├── backend/
│   ├── src/
│   │   ├── config/         # Database config
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── types/          # TypeScript types
│   └── package.json
├── database/
│   └── schema.sql          # Database schema
├── src/
│   ├── components/         # React components
│   ├── contexts/           # React contexts
│   ├── services/           # API & Web3 services
│   └── types/              # TypeScript types
└── package.json
```

## Contributing

This is an educational project. Contributions for learning purposes are welcome!

## License

MIT License - See LICENSE file

## Disclaimer

This software is provided "as is" without warranty of any kind. The authors are not responsible for any losses incurred through the use of this software. This is for educational purposes only. Do not use with real funds without proper audits and legal consultation.

## Contact

For educational inquiries and questions, please open an issue on GitHub.

---

Built with ❤️ for learning DeFi development
