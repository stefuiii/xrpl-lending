const { transferXRP, getBalance } = require('./xrplService');

// 用户存款到放贷池
async function deposit(amount, userWalletAddress, userWalletSeed) {
  const lendingPoolAddress = process.env.LENDING_POOL_ADDRESS;

  // 转账操作
  return await transferXRP(amount, userWalletAddress, lendingPoolAddress, userWalletSeed);
}

// 用户从放贷池借款
async function borrow(amount, userWalletAddress) {
  const lendingPoolAddress = process.env.LENDING_POOL_ADDRESS;
  const lendingPoolSeed = process.env.LENDING_POOL_SEED;

  // 检查放贷池余额
  const poolBalance = await getBalance(lendingPoolAddress);
  if (poolBalance < amount) {
    return { success: false, error: 'Insufficient funds in Lending Pool' };
  }

  // 从放贷池转账到用户
  return await transferXRP(amount, lendingPoolAddress, userWalletAddress, lendingPoolSeed);
}

module.exports = { deposit, borrow };
