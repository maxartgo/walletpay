import mongoose from 'mongoose';
import { User } from './src/models/User.js';
import { Deposit } from './src/models/Deposit.js';

async function checkUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/walletpay');
    console.log('Connected to MongoDB');

    const targetAddress = '0x1aaccd0ea502d89443d7a70ce68fcff49200292e';

    // Check all users
    const allUsers = await User.find({});
    console.log('\n=== ALL USERS ===');
    console.log(`Total users: ${allUsers.length}`);
    allUsers.forEach(user => {
      console.log(`- ${user.walletAddress} (created: ${user.createdAt})`);
    });

    // Check specific user
    console.log('\n=== SEARCHING FOR USER ===');
    const userExact = await User.findOne({ walletAddress: targetAddress });
    console.log('Exact match:', userExact ? 'FOUND' : 'NOT FOUND');

    const userLower = await User.findOne({ walletAddress: targetAddress.toLowerCase() });
    console.log('Lowercase match:', userLower ? 'FOUND' : 'NOT FOUND');

    // Check deposits
    console.log('\n=== ALL DEPOSITS ===');
    const allDeposits = await Deposit.find({});
    console.log(`Total deposits: ${allDeposits.length}`);
    allDeposits.forEach(deposit => {
      console.log(`- ${deposit.walletAddress}: ${deposit.amount} USDT (${deposit.status})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkUser();
