const lendingPoolState = {
    totalDeposits: 0,
    rewardPool: 1000,
    deposits: [],
  };
  
  function addDeposit(userWalletAddress, amount, incentive) {
    const userDeposit = lendingPoolState.deposits.find(d => d.userWalletAddress === userWalletAddress);
    if (userDeposit) {
      userDeposit.depositAmount += amount;
      userDeposit.interestEarned += incentive;
    } else {
      lendingPoolState.deposits.push({ userWalletAddress, depositAmount: amount, interestEarned: incentive });
    }
    lendingPoolState.totalDeposits += amount;
    lendingPoolState.rewardPool -= incentive;
  }
  
  function distributeRewards() {
    const results = [];
    lendingPoolState.deposits.forEach(deposit => {
      const reward = deposit.depositAmount * 0.01; // 固定奖励率
      deposit.interestEarned += reward;
      lendingPoolState.rewardPool -= reward;
      results.push({ userWalletAddress: deposit.userWalletAddress, reward });
    });
    return results;
  }
  
  module.exports = { addDeposit, distributeRewards, lendingPoolState };
  