const { transferXRP, getBalance } = require('./xrplService');
const { calculateReward } = require('../utils/rewardCalculator');
const lendingPool = require('../models/lendingPool');

// deposit to the lending pool
async function depositToLendingPool(amount, userWalletAddress, userWalletSeed) {
  const lendingPoolAddress = process.env.LENDING_POOL_ADDRESS;
  const lendingPoolSeed = process.env.LENDING_POOL_SEED;
  const rewardRate = 0.01; 
  const incentive = calculateReward(amount, rewardRate);

  const transferResult = await transferXRP(amount, userWalletAddress, lendingPoolAddress, userWalletSeed);
  if (!transferResult.success) {
    throw new Error(transferResult.error);
  }

  if (incentive > 0) {
    const incentiveResult = await transferXRP(incentive, lendingPoolAddress, userWalletAddress, lendingPoolSeed);
    if (!incentiveResult.success) {
      throw new Error(`Failed to send incentive: ${incentiveResult.error}`);
    }
    console.log(`✅ Incentive of ${incentive} XRP sent to ${userWalletAddress}`);
  }

  // update
  lendingPool.addDeposit(userWalletAddress, amount, incentive);

  return { ...transferResult, incentive };
}

// borrow operation
async function borrowFromLendingPool(amount, userWalletAddress) {
    const lendingPoolAddress = process.env.LENDING_POOL_ADDRESS;
    const lendingPoolSeed = process.env.LENDING_POOL_SEED;
  
    console.log('💡 Checking Lending Pool Balance...');
    const poolBalance = await getBalance(lendingPoolAddress);
    console.log(`✅ Lending Pool Balance: ${poolBalance} XRP`);
  
    if (poolBalance < amount) {
      console.error('❌ Insufficient funds in Lending Pool');
      return { success: false, error: 'Insufficient funds in Lending Pool' };
    }
  
    console.log('💡 Initiating transfer from Lending Pool to User...');
    try {
      const transferResult = await transferXRP(
        amount,
        lendingPoolAddress,
        userWalletAddress,
        lendingPoolSeed
      );
      console.log('✅ Transfer Result:', transferResult);
      return transferResult;
    } catch (error) {
      console.error('❌ Transfer Error:', error.message);
      throw new Error('Failed to complete borrowing');
    }
  }

async function distributeIncentives() {
  const rewardResults = lendingPool.distributeRewards();
  return rewardResults;
}

module.exports = { depositToLendingPool, borrowFromLendingPool, distributeIncentives };
