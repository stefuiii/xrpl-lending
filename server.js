const express = require('express');
const { deposit, borrow } = require('./lendingController');
require('dotenv').config();

const app = express();
app.use(express.json());

// 用户向放贷池存款
app.post('/api/lending/deposit', async (req, res) => {
  const { amount, userWalletAddress, userWalletSeed } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }
  if (!userWalletAddress || !userWalletSeed) {
    return res.status(400).json({ error: 'User wallet details are required' });
  }

  try {
    const result = await deposit(amount, userWalletAddress, userWalletSeed);
    if (result.success) {
      res.json({ message: 'Deposit successful', txHash: result.txHash });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('❌ Deposit Error:', error.message);
    res.status(500).json({ error: 'Failed to deposit to Lending Pool' });
  }
});

// 用户从放贷池借款
app.post('/api/lending/withdraw', async (req, res) => {
    const { amount, userWalletAddress, lendingPoolSeed, lendingPoolAddress } = req.body;
  
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    if (!userWalletAddress || !lendingPoolSeed || !lendingPoolAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    try {
      console.log(`💸 Initiating withdrawal of ${amount} XRP from ${lendingPoolAddress} to ${userWalletAddress}`);
  
      // 调用 XRPL Service 处理提现逻辑
      const result = await borrow(amount, lendingPoolAddress, userWalletAddress, lendingPoolSeed);
  
      if (result.success) {
        return res.json({ message: 'Withdrawal successful', txHash: result.txHash });
      } else {
        return res.status(500).json({ error: result.error });
      }
    } catch (error) {
      console.error('❌ Withdrawal Error:', error.message);
      return res.status(500).json({ error: 'Failed to complete withdrawal' });
    }
  });

app.listen(3001, () => {
  console.log('✅ API Server running at http://localhost:3001');
});
