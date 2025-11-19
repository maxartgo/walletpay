# WalletPay API Documentation

## Overview

WalletPay is a DeFi platform with a multi-cycle yield system that rewards users based on their participation. The system distinguishes between **Veteran** users (who have completed at least one cycle) and **New** users (currently in their first cycle).

### Base URL
```
http://localhost:3001/api
```

---

## Core Concepts

### Multi-Cycle System

The platform operates in **cycles**, which are independent time periods that:
- Start when created and end when the deposit goal (10,000 USDT) is reached
- Track deposits and yield distributions separately
- Automatically promote participants to veteran status when completed

### User Status

**New Users:**
- Currently participating in their first cycle
- Must deposit at least 100 USDT to receive yields
- **Cannot withdraw** until their first cycle completes
- Yields are locked until veteran status is achieved

**Veteran Users:**
- Have completed at least one cycle
- Receive yields in ALL future cycles, even without depositing
- **Can withdraw** yields at any time
- Can also withdraw referral earnings

### Yield Distribution

- Daily yield rate: **0.05%** of total cycle deposits
- Distributed **equally** to all eligible recipients:
  - All veteran users (regardless of current cycle deposits)
  - New users who deposited ≥ 100 USDT in the current cycle
- Example: If 5 users are eligible and cycle deposits = 10,000 USDT, each receives 1 USDT daily (10,000 × 0.05% ÷ 5)

### Withdrawal Rules

- **10% tax** applied to all withdrawals
- Only **yields** can be withdrawn (deposits remain locked)
- Veterans: Unrestricted yield withdrawals
- New users: All withdrawals blocked until first cycle completes
- Referral earnings: Only veterans can withdraw

---

## Authentication

### Admin Endpoints

Admin endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## API Endpoints

### Health Check

#### Get Health Status
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### User Endpoints

#### Get User Profile
```http
GET /users/:wallet
```

**Parameters:**
- `wallet` - User's wallet address

**Response:**
```json
{
  "id": 1,
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "referrer_address": "0x...",
  "total_deposited": 1000.0,
  "total_yield_earned": 50.0,
  "total_referral_earned": 25.0,
  "withdrawable_balance": 75.0,
  "is_veteran": true,
  "first_cycle_completed": 1,
  "direct_referrals": 5,
  "level2_referrals": 10,
  "level3_referrals": 15,
  "level4_referrals": 8,
  "level5_referrals": 3,
  "created_at": "2025-01-01T00:00:00.000Z",
  "updated_at": "2025-01-15T10:30:00.000Z"
}
```

#### Get User Statistics
```http
GET /users/:wallet/stats
```

**Response:**
```json
{
  "id": 1,
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "total_deposited": 1000.0,
  "total_yield_earned": 50.0,
  "total_referral_earned": 25.0,
  "is_veteran": true,
  "referral_stats": {
    "level1_count": 5,
    "level2_count": 10,
    "level3_count": 15,
    "level4_count": 8,
    "level5_count": 3,
    "total_referral_earnings": 25.0
  }
}
```

#### Get User Referral Tree
```http
GET /users/:wallet/referrals
```

**Response:**
```json
{
  "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "referrals": [
    {
      "level": 1,
      "wallet_address": "0x...",
      "total_deposited": 500.0,
      "created_at": "2025-01-02T00:00:00.000Z"
    }
  ]
}
```

#### Get User Yield History
```http
GET /users/:wallet/yields
```

**Response:**
```json
{
  "user": { /* user object */ },
  "totalYieldEarned": 50.0,
  "yieldsByCycle": {
    "1": [
      {
        "id": 1,
        "user_id": 1,
        "amount": 1.0,
        "global_balance": 10000.0,
        "yield_date": "2025-01-10",
        "cycle_id": 1,
        "created_at": "2025-01-10T00:00:00.000Z"
      }
    ]
  },
  "cycleParticipations": [
    {
      "id": 1,
      "user_id": 1,
      "cycle_id": 1,
      "deposited_amount": 1000.0,
      "total_yield_earned": 50.0,
      "first_deposit_at": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Deposit Endpoints

#### Create Deposit
```http
POST /deposits
```

**Request Body:**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "amount": 1000.0,
  "referrerAddress": "0x..." // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Deposit successful",
  "deposit": {
    "id": 1,
    "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "amount": 1000.0,
    "cycle_id": 1,
    "created_at": "2025-01-15T10:30:00.000Z"
  },
  "cycle": {
    "id": 1,
    "cycle_number": 1,
    "total_deposits": 5000.0,
    "active_wallets": 10,
    "status": "active"
  },
  "referralEarnings": [
    {
      "level": 1,
      "wallet": "0x...",
      "amount": 30.0,
      "percentage": 3
    }
  ]
}
```

**Referral Commission Structure:**
- Level 1: 3%
- Level 2: 2%
- Level 3: 1.5%
- Level 4: 1%
- Level 5: 0.5%

#### Get User Deposits
```http
GET /deposits/:wallet
```

**Response:**
```json
{
  "deposits": [
    {
      "id": 1,
      "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "amount": 1000.0,
      "created_at": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

#### Get All Deposits (Admin)
```http
GET /deposits
```

**Response:**
```json
{
  "deposits": [/* array of deposits */]
}
```

---

### Withdrawal Endpoints

#### Create Yield Withdrawal
```http
POST /withdrawals
```

**Request Body:**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "amount": 50.0
}
```

**Success Response (Veteran):**
```json
{
  "success": true,
  "message": "Withdrawal processed successfully",
  "userStatus": "veteran",
  "grossAmount": 50.0,
  "taxAmount": 5.0,
  "netAmount": 45.0,
  "taxRate": "10%",
  "remainingWithdrawable": 25.0
}
```

**Error Response (New User):**
```json
{
  "error": "Withdrawals locked. You must complete your first cycle before withdrawing.",
  "userStatus": "new",
  "message": "New users can only withdraw after their first cycle completes."
}
```

#### Withdraw Referral Balance
```http
POST /withdrawals/referral
```

**Request Body:**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Referral balance withdrawn successfully",
  "userStatus": "veteran",
  "grossAmount": 25.0,
  "taxAmount": 2.5,
  "netAmount": 22.5,
  "taxRate": "10%",
  "newReferralBalance": 0,
  "newWithdrawableBalance": 50.0
}
```

#### Get User Withdrawals
```http
GET /withdrawals/:wallet
```

**Response:**
```json
{
  "withdrawals": [
    {
      "id": 1,
      "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "amount": 45.0,
      "type": "yield",
      "status": "pending",
      "created_at": "2025-01-15T10:30:00.000Z",
      "processed_at": null,
      "completed_at": null,
      "admin_note": null
    }
  ]
}
```

#### Get Withdrawable Balance
```http
GET /withdrawals/:wallet/balance
```

**Response:**
```json
{
  "success": true,
  "userStatus": "veteran",
  "isVeteran": true,
  "firstCycleCompleted": 1,
  "withdrawable": {
    "yields": 50.0,
    "referrals": 25.0,
    "total": 75.0
  },
  "locked": {
    "yields": 0,
    "deposits": 1000.0,
    "total": 1000.0
  },
  "cycleBreakdown": [
    {
      "cycleNumber": 1,
      "cycleStatus": "completed",
      "deposited": 1000.0,
      "yieldEarned": 50.0,
      "withdrawable": true
    }
  ]
}
```

---

### Stats Endpoints

#### Get Global Statistics
```http
GET /stats/global
```

**Response:**
```json
{
  "total_deposits": 50000.0,
  "total_users": 100,
  "total_yield_distributed": 2500.0,
  "active_users": 85,
  "total_referral_earnings": 1000.0
}
```

#### Get Leaderboard
```http
GET /stats/leaderboard
```

**Query Parameters:**
- `limit` - Number of results (default: 10)

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "total_deposited": 5000.0,
      "total_yield_earned": 250.0,
      "total_referral_earned": 150.0,
      "total_earnings": 400.0
    }
  ]
}
```

---

### Admin Endpoints

All admin endpoints require authentication via JWT token.

#### Admin Login
```http
POST /admin/login
```

**Request Body:**
```json
{
  "username": "admin",
  "password": "your-password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": 1,
    "username": "admin",
    "email": "admin@walletpay.com"
  }
}
```

#### Change Admin Password
```http
POST /admin/change-password
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "currentPassword": "old-password",
  "newPassword": "new-password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

#### Get Pending Withdrawals
```http
GET /admin/withdrawals/pending
```

**Response:**
```json
{
  "success": true,
  "withdrawals": [
    {
      "id": 1,
      "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "amount": 45.0,
      "type": "yield",
      "status": "pending",
      "created_at": "2025-01-15T10:30:00.000Z",
      "processed_by_username": "N/A"
    }
  ]
}
```

#### Get All Withdrawals
```http
GET /admin/withdrawals
```

**Query Parameters:**
- `status` - Filter by status (pending, completed, rejected)
- `limit` - Results per page (default: 100)
- `offset` - Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "withdrawals": [/* array of withdrawals */],
  "total": 150,
  "limit": 100,
  "offset": 0
}
```

#### Approve Withdrawal
```http
POST /admin/withdrawals/:id/approve
```

**Request Body:**
```json
{
  "note": "Approved - transaction hash: 0x..." // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Withdrawal approved successfully",
  "withdrawal": {
    "id": 1,
    "status": "completed",
    "processed_at": "2025-01-15T10:35:00.000Z",
    "completed_at": "2025-01-15T10:35:00.000Z",
    "admin_note": "Approved - transaction hash: 0x..."
  }
}
```

#### Reject Withdrawal
```http
POST /admin/withdrawals/:id/reject
```

**Request Body:**
```json
{
  "note": "Rejected - insufficient funds" // Required
}
```

**Response:**
```json
{
  "success": true,
  "message": "Withdrawal rejected and amount refunded",
  "refundedAmount": 50.0
}
```

Note: Rejecting a withdrawal refunds the gross amount (before tax) back to the user's withdrawable balance.

#### Get Admin Stats
```http
GET /admin/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "pending_count": 10,
    "completed_count": 100,
    "rejected_count": 5,
    "pending_amount": 500.0,
    "completed_amount": 10000.0,
    "rejected_amount": 250.0
  }
}
```

#### Get Current Cycle Stats
```http
GET /admin/cycle
```

**Response:**
```json
{
  "success": true,
  "cycle": {
    "active": true,
    "number": 2,
    "startDate": "2025-01-10T00:00:00.000Z",
    "deposits": 7500.0,
    "activeWallets": 50,
    "withdrawalsUnlocked": false,
    "unlockDate": null,
    "goals": {
      "deposits": 10000.0,
      "users": 10000,
      "depositProgress": "75.00%",
      "userProgress": "0.50%"
    }
  }
}
```

#### Reset Cycle (Legacy)
```http
POST /admin/cycle/reset
```

**Response:**
```json
{
  "success": true,
  "message": "Cycle reset successfully. New rotation started.",
  "stats": {/* new cycle stats */}
}
```

Note: This endpoint is from the old system and may be deprecated. Cycles now complete automatically.

---

### Admin Cycle Management Endpoints

#### Get All Cycles
```http
GET /admin/cycles
```

**Response:**
```json
{
  "success": true,
  "cycles": [
    {
      "id": 2,
      "cycle_number": 2,
      "start_date": "2025-01-10T00:00:00.000Z",
      "end_date": null,
      "total_deposits": 7500.0,
      "active_wallets": 50,
      "status": "active",
      "participantCount": 50,
      "totalYieldDistributed": 375.0
    },
    {
      "id": 1,
      "cycle_number": 1,
      "start_date": "2025-01-01T00:00:00.000Z",
      "end_date": "2025-01-09T23:59:59.000Z",
      "total_deposits": 10000.0,
      "active_wallets": 45,
      "status": "completed",
      "participantCount": 45,
      "totalYieldDistributed": 500.0
    }
  ]
}
```

#### Get Cycle Details
```http
GET /admin/cycles/:id
```

**Response:**
```json
{
  "success": true,
  "cycle": {
    "id": 1,
    "cycle_number": 1,
    "start_date": "2025-01-01T00:00:00.000Z",
    "end_date": "2025-01-09T23:59:59.000Z",
    "total_deposits": 10000.0,
    "active_wallets": 45,
    "status": "completed"
  },
  "participantCount": 45,
  "totalYieldDistributed": 500.0,
  "participants": [
    {
      "userId": 1,
      "deposited": 1000.0,
      "yieldEarned": 50.0
    }
  ]
}
```

#### Get Cycle Participants
```http
GET /admin/cycles/:id/participants
```

**Response:**
```json
{
  "success": true,
  "cycleId": 1,
  "participantCount": 45,
  "participants": [
    {
      "userId": 1,
      "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "isVeteran": true,
      "deposited": 1000.0,
      "yieldEarned": 50.0,
      "firstDepositAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get Cycle Yield Distribution History
```http
GET /admin/cycles/:id/yields
```

**Response:**
```json
{
  "success": true,
  "cycleId": 1,
  "yieldDistributions": [
    {
      "date": "2025-01-09",
      "totalDistributed": 50.0,
      "recipientCount": 45,
      "recipients": [
        {
          "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
          "amount": 1.11111111,
          "isVeteran": true
        }
      ]
    }
  ]
}
```

---

## Database Schema

### Tables

#### users
```sql
- id: SERIAL PRIMARY KEY
- wallet_address: VARCHAR(255) UNIQUE
- referrer_address: VARCHAR(255)
- total_deposited: DECIMAL(20, 6)
- total_yield_earned: DECIMAL(20, 6)
- total_referral_earned: DECIMAL(20, 6)
- withdrawable_balance: DECIMAL(20, 6)
- is_veteran: BOOLEAN DEFAULT FALSE
- first_cycle_completed: INTEGER
- direct_referrals: INTEGER DEFAULT 0
- level2_referrals: INTEGER DEFAULT 0
- level3_referrals: INTEGER DEFAULT 0
- level4_referrals: INTEGER DEFAULT 0
- level5_referrals: INTEGER DEFAULT 0
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### cycles
```sql
- id: SERIAL PRIMARY KEY
- cycle_number: INTEGER UNIQUE
- start_date: TIMESTAMP
- end_date: TIMESTAMP
- total_deposits: DECIMAL(20, 6)
- active_wallets: INTEGER
- status: VARCHAR(20) ('active' | 'completed')
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### user_cycle_participation
```sql
- id: SERIAL PRIMARY KEY
- user_id: INTEGER (FK -> users.id)
- cycle_id: INTEGER (FK -> cycles.id)
- deposited_amount: DECIMAL(20, 6)
- total_yield_earned: DECIMAL(20, 6)
- first_deposit_at: TIMESTAMP
- UNIQUE(user_id, cycle_id)
```

#### deposits
```sql
- id: SERIAL PRIMARY KEY
- wallet_address: VARCHAR(255)
- amount: DECIMAL(20, 6)
- created_at: TIMESTAMP
```

#### daily_yields
```sql
- id: SERIAL PRIMARY KEY
- user_id: INTEGER (FK -> users.id)
- amount: DECIMAL(20, 6)
- global_balance: DECIMAL(20, 6)
- yield_date: DATE
- cycle_id: INTEGER (FK -> cycles.id)
- created_at: TIMESTAMP
- UNIQUE(user_id, yield_date)
```

#### withdrawals
```sql
- id: SERIAL PRIMARY KEY
- wallet_address: VARCHAR(255)
- amount: DECIMAL(20, 6)
- type: VARCHAR(20) ('yield' | 'referral')
- status: VARCHAR(20) ('pending' | 'completed' | 'rejected')
- admin_note: TEXT
- processed_by: INTEGER (FK -> admins.id)
- processed_at: TIMESTAMP
- completed_at: TIMESTAMP
- created_at: TIMESTAMP
```

#### referral_earnings
```sql
- id: SERIAL PRIMARY KEY
- user_id: INTEGER (FK -> users.id)
- from_user_id: INTEGER (FK -> users.id)
- amount: DECIMAL(20, 6)
- level: INTEGER
- deposit_id: INTEGER (FK -> deposits.id)
- created_at: TIMESTAMP
```

#### admins
```sql
- id: SERIAL PRIMARY KEY
- username: VARCHAR(255) UNIQUE
- password_hash: VARCHAR(255)
- email: VARCHAR(255)
- last_login: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

---

## Business Logic

### Cycle Completion Flow

1. User deposits reach 10,000 USDT goal
2. `CycleModel.checkAndCompleteCycle()` is called
3. Current cycle marked as 'completed' with end_date
4. All participants promoted to veteran status (is_veteran = TRUE)
5. New cycle automatically created and marked as 'active'
6. Veteran users now receive yields in new cycle without depositing

### Yield Calculation (Daily Cron Job)

1. Get active cycle
2. Calculate total cycle deposits (only wallets with ≥ 100 USDT)
3. Calculate daily yield: `(total_deposits × 0.05%) ÷ recipient_count`
4. Get eligible recipients:
   - All veterans (even without deposits in current cycle)
   - New users with ≥ 100 USDT in current cycle
5. Distribute same amount to each recipient
6. Update user totals and cycle participation records
7. Check if cycle should complete

### Withdrawal Processing

**For Yield Withdrawals:**
1. Check user veteran status
2. Calculate withdrawable yield (completed cycles only for new users)
3. Apply 10% tax
4. Deduct gross amount from total_yield_earned and withdrawable_balance
5. Record net amount in withdrawals table
6. Set status to 'pending' for admin approval

**For Referral Withdrawals:**
1. Check user is veteran (new users blocked)
2. Get total_referral_earned amount
3. Apply 10% tax
4. Deduct gross amount from withdrawable_balance
5. Reset total_referral_earned to 0
6. Record net amount in withdrawals table

### Deposit Referral Commissions

When a user deposits with a referrer:
1. Traverse referral chain up to 5 levels
2. Calculate commissions: L1(3%), L2(2%), L3(1.5%), L4(1%), L5(0.5%)
3. Add to each referrer's total_referral_earned
4. Increment referrer's level counters
5. Record in referral_earnings table

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/walletpay

# Server
PORT=3001
NODE_ENV=development

# Yield Configuration
DAILY_YIELD_PERCENTAGE=0.05
GLOBAL_DEPOSIT_GOAL=10000

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
```

---

## Error Codes

### Common HTTP Status Codes

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### Error Response Format

```json
{
  "error": "Error message describing what went wrong"
}
```

---

## Notes

### Testing with Postman

1. Login as admin to get JWT token
2. Set Authorization header for protected endpoints
3. Use wallet addresses in lowercase for consistency
4. Test cycle completion by depositing to reach 10,000 USDT goal

### Security Considerations

- Always use HTTPS in production
- Store JWT_SECRET securely
- Never expose admin credentials
- Validate all wallet addresses
- Implement rate limiting for API endpoints
- Add transaction verification before processing deposits/withdrawals

### Future Enhancements

- Blockchain integration for real deposits/withdrawals
- Email notifications for withdrawal status
- Two-factor authentication for admin panel
- Automated backup and recovery system
- Real-time WebSocket updates for dashboard
