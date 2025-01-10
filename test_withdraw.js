const axios = require('axios');

async function testWithdraw() {
  const apiUrl = 'http://localhost:3001/api/lending/withdraw';
  const requestData = {
    amount: 5, // 提现金额
    userWalletAddress: 'rJsfvrHVYMoXhV67GgZdzoXGidbgQZ7b6J', // 用户钱包地址
    lendingPoolAddress: 'rHdHDKXM5gp1HMrMseMfsJxPWDfmb1vApM', // 放贷池地址
    lendingPoolSeed: 'sEdTG5TKBRCAG69LVDsfpa2N1M9fhUx' // 放贷池私钥
  };

  try {
    const response = await axios.post(apiUrl, requestData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('✅ Withdraw Test Successful:', response.data);
  } catch (error) {
    console.error('❌ Withdraw Test Failed:', error.response ? error.response.data : error.message);
  }
}

testWithdraw();
