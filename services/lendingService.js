const { transferXRP, getBalance } = require('./xrplService');
const { calculateReward } = require('../utils/rewardCalculator');
const lendingPool = require('../models/lendingPool');

// 存款到放贷池
async function depositToLendingPool(amount, userWalletAddress, userWalletSeed) {
  const lendingPoolAddress = process.env.LENDING_POOL_ADDRESS;
  const rewardRate = 0.01; // 固定奖励率（1%）
  const incentive = calculateReward(amount, rewardRate);

  // 转账到 Lending Pool
  const transferResult = await transferXRP(amount, userWalletAddress, lendingPoolAddress, userWalletSeed);
  if (!transferResult.success) {
    throw new Error(transferResult.error);
  }

  // 更新 Lending Pool 状态
  lendingPool.addDeposit(userWalletAddress, amount, incentive);

  return { ...transferResult, incentive };
}

// 借款逻辑
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
// 分发奖励
async function distributeIncentives() {
  const rewardResults = lendingPool.distributeRewards();
  return rewardResults;
}

module.exports = { depositToLendingPool, borrowFromLendingPool, distributeIncentives };
