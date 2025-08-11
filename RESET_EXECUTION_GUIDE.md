# How to Reset Executed Arbitrage Opportunities

You now have multiple ways to reset executed arbitrage opportunities:

## Method 1: Reset Individual Opportunities from Arbitrage Page

1. **Navigate to `/arbitrage` page**
2. **Find executed opportunities** (they show "EXECUTED" badge and execution results)
3. **Click the "Reset" button** (replaces the "Execute" button for executed opportunities)
4. **Confirm the reset** when prompted
5. **The opportunity will revert to unexecuted state** and positions will be removed from portfolio

## Method 2: Reset All Executions from Arbitrage Page

1. **Navigate to `/arbitrage` page**
2. **Look for the "Reset All" button** in the top-right corner (only appears if you have executed opportunities)
3. **Click "Reset All"**
4. **Confirm the action** when prompted
5. **All executions will be reset** and portfolio will be cleared

## Method 3: Reset from Portfolio Page

### Individual Execution Reset
1. **Navigate to `/portfolio` page**
2. **Go to "Arbitrage History" tab**
3. **Find the execution you want to reset**
4. **Click the "Reset" button** in the Actions column
5. **Confirm the reset** when prompted

### Clear Entire Portfolio
1. **Navigate to `/portfolio` page**
2. **Click "Clear Portfolio" button** in the top-right corner
3. **Confirm the action** when prompted
4. **All portfolio data will be cleared** (positions and executions)

## What Happens When You Reset?

### Individual Reset:
- ✅ Opportunity reverts to unexecuted state
- ✅ Related positions removed from portfolio
- ✅ Execution record removed from history
- ✅ Portfolio statistics updated

### Reset All/Clear Portfolio:
- ✅ All opportunities revert to unexecuted state
- ✅ All positions removed from portfolio
- ✅ All execution history cleared
- ✅ Portfolio statistics reset to zero

## Testing the Reset Functionality

### Quick Test Cycle:
1. **Execute a few arbitrage opportunities**
2. **Check portfolio to see positions and execution history**
3. **Reset individual executions** using any method above
4. **Verify they disappear from portfolio and revert on arbitrage page**
5. **Execute more opportunities**
6. **Use "Reset All" or "Clear Portfolio" to reset everything**

### Visual Confirmations:
- **Arbitrage cards** change from "EXECUTED" badge back to "Execute" button
- **Portfolio positions** are removed
- **Execution history** is cleared
- **Statistics** update to reflect changes

## Important Notes

- ⚠️ **Reset actions cannot be undone** - use with caution
- ⚠️ **Confirmation dialogs** appear for all reset actions
- ✅ **Safe for testing** - all data is stored locally
- ✅ **Real-time updates** - changes reflect immediately across all pages

This reset functionality is perfect for testing and development purposes!
