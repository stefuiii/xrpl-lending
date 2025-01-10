const { depositToLendingPool, borrowFromLendingPool, distributeIncentives } = require('../services/lendingService');

exports.deposit = async (req, res) => {
  const { amount, userWalletAddress, userWalletSeed } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }
  if (!userWalletAddress || !userWalletSeed) {
    return res.status(400).json({ error: 'User wallet details are required' });
  }

  try {
    const result = await depositToLendingPool(amount, userWalletAddress, userWalletSeed);
    res.json(result);
  } catch (error) {
    console.error('❌ Deposit Error:', error.message);
    res.status(500).json({ error: 'Failed to deposit to Lending Pool' });
  }
};

exports.borrow = async (req, res) => {
  const { amount, userWalletAddress } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }
  if (!userWalletAddress) {
    return res.status(400).json({ error: 'User wallet address is required' });
  }

  try {
    const result = await borrowFromLendingPool(amount, userWalletAddress);
    res.json(result);
  } catch (error) {
    console.error('❌ Borrow Error:', error.message);
    res.status(500).json({ error: 'Failed to complete borrowing' });
  }
};

exports.distributeRewards = async (req, res) => {
  try {
    const result = await distributeIncentives();
    res.json(result);
  } catch (error) {
    console.error('❌ Distribute Rewards Error:', error.message);
    res.status(500).json({ error: 'Failed to distribute rewards' });
  }
};
