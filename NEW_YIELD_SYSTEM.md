# New Yield Calculation System

## Overview
The yield system has been completely redesigned to implement a cycle-based platform-wide yield distribution model.

## Key Changes

### 1. Yield Rate
- **Changed from:** 0.1% daily
- **Changed to:** 0.05% daily
- **Location:** `backend/.env` → `DAILY_YIELD_PERCENTAGE=0.05`

### 2. System Activation
- **Trigger:** First wallet deposits ≥ 100 USDT
- **Behavior:** Automatically activates the yield cycle
- **Implementation:** [DepositService.ts:77-81](backend/src/services/DepositService.ts#L77-L81)

### 3. Active Wallet Requirements
- **Minimum deposit:** 100 USDT
- **Status:** Only wallets with total deposits ≥ 100 USDT are considered "active"
- **Yield eligibility:** Only active wallets receive daily yields

### 4. Yield Calculation Method
**Old System:**
- Each user received yield based on their individual deposit
- Formula: `yieldAmount = (user.total_deposited * 0.1) / 100`
- Different amount for each user

**New System:**
- Yield calculated on TOTAL platform deposits (cycle_deposits)
- Formula: `yieldAmount = (cycle_deposits * 0.05) / 100`
- **Same amount** distributed to ALL active wallets
- Implementation: [YieldService.ts:41](backend/src/services/YieldService.ts#L41)

### 5. Cycle Management

#### Cycle Tracking Fields (added to `global_stats` table)
- `cycle_active` (BOOLEAN): Whether cycle is currently active
- `cycle_start_date` (TIMESTAMP): When current cycle started
- `cycle_number` (INTEGER): Sequential cycle counter
- `cycle_deposits` (DECIMAL): Total deposits in current cycle
- `cycle_active_wallets` (INTEGER): Number of active wallets

#### Cycle Lifecycle

**Activation:**
- Triggered by first deposit ≥ 100 USDT
- Sets `cycle_active = TRUE`
- Increments `cycle_number`
- Records `cycle_start_date`

**Running:**
- Daily cron job at 00:00 calculates yields
- Updates `cycle_deposits` and `cycle_active_wallets` on each new deposit
- Only runs if `cycle_active = TRUE`

**Completion:**
- Automatically stops when goals reached:
  - `cycle_deposits >= GLOBAL_DEPOSIT_GOAL` (10,000 USDT)
  - `cycle_active_wallets >= WALLET_COUNT_GOAL` (10,000 wallets)
- Sets `cycle_active = FALSE`
- Unlocks withdrawals
- Implementation: [YieldService.ts:19-24](backend/src/services/YieldService.ts#L19-L24)

**Reset:**
- Admin can manually reset via API
- Endpoint: `POST /api/admin/cycle/reset`
- Resets `cycle_deposits` and `cycle_active_wallets` to 0
- Unlocks withdrawals back to FALSE
- Starts new rotation
- Implementation: [AdminController.ts:328-360](backend/src/controllers/AdminController.ts#L328-L360)

## Examples

### Example 1: System Activation
```
Day 1, 10:00 AM:
- Wallet A deposits 100 USDT → System ACTIVATES
- cycle_active = TRUE
- cycle_deposits = 100 USDT
- cycle_active_wallets = 1

Day 1, 2:00 PM:
- Wallet B deposits 200 USDT
- cycle_deposits = 300 USDT (only counts active wallets)
- cycle_active_wallets = 2

Day 1, 5:00 PM:
- Wallet C deposits 50 USDT (not active, < 100 USDT)
- cycle_deposits = 300 USDT (unchanged)
- cycle_active_wallets = 2 (unchanged)
```

### Example 2: Daily Yield Calculation
```
Day 2, 00:00 (midnight cron runs):
- cycle_deposits = 300 USDT
- cycle_active_wallets = 2
- Daily yield = (300 * 0.05) / 100 = 0.15 USDT

Distribution:
- Wallet A (deposited 100): +0.15 USDT
- Wallet B (deposited 200): +0.15 USDT
- Wallet C (deposited 50): +0 USDT (not active)

Total distributed: 0.30 USDT
```

### Example 3: Growing Platform
```
Day 10:
- 500 active wallets (each deposited >= 100 USDT)
- cycle_deposits = 150,000 USDT
- Daily yield = (150,000 * 0.05) / 100 = 75 USDT

Distribution:
- Each of 500 wallets receives: 75 USDT (same amount!)
```

## Database Migration

Applied migration: [003_add_cycle_tracking.sql](database/migrations/003_add_cycle_tracking.sql)

Run with:
```bash
cd backend
node scripts/apply-cycle-migration.js
```

## New Admin Endpoints

### Get Cycle Stats
```
GET /api/admin/cycle
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "cycle": {
    "active": true,
    "number": 1,
    "startDate": "2025-10-31T03:00:00.000Z",
    "deposits": 5000.50,
    "activeWallets": 45,
    "withdrawalsUnlocked": false,
    "unlockDate": null,
    "goals": {
      "deposits": 10000,
      "users": 10000,
      "depositProgress": "50.01%",
      "userProgress": "0.45%"
    }
  }
}
```

### Reset Cycle
```
POST /api/admin/cycle/reset
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "message": "Cycle reset successfully. New rotation started.",
  "stats": { ... }
}
```

## Benefits of New System

1. **Fairness:** All active participants receive equal daily amounts
2. **Incentive:** Encourages reaching 100 USDT minimum to become active
3. **Growth Focus:** Yield grows with platform success, not individual deposits
4. **Sustainability:** Cycle-based system allows for continuous operation
5. **Transparency:** Clear activation and completion criteria

## Testing the System

To test the new yield system:

1. Make first deposit >= 100 USDT to activate cycle
2. Check `cycle_active` in global_stats → should be TRUE
3. Make additional deposits from different wallets
4. Run manual yield calculation:
   ```bash
   curl -X POST http://localhost:3001/api/admin/manual-yield
   ```
5. Verify all active wallets received same amount
6. Check cycle stats via admin endpoint

## Important Notes

- ⚠️ Yields only calculated when `cycle_active = TRUE`
- ⚠️ Minimum 100 USDT required to be "active"
- ⚠️ All active wallets receive SAME daily amount
- ⚠️ Cycle auto-stops when goals reached
- ⚠️ Admin must manually reset to start new cycle
- ⚠️ Daily calculations run at 00:00 via cron job
