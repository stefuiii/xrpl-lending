const axios = require('axios');

// 测试存款功能
async function testDeposit() {
  const apiUrl = 'http://localhost:3001/api/lending/deposit';
  const requestData = {
    amount: 5, // 测试存款金额
    userWalletAddress: 'rJsfvrHVYMoXhV67GgZdzoXGidbgQZ7b6J', // 用户钱包地址
    userWalletSeed: 'sEdTG5TKBRCAG69LVDsfpa2N1M9fhUx', // 用户钱包种子
  };

  try {
    const response = await axios.post(apiUrl, requestData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('✅ Deposit Test Successful:', response.data);
  } catch (error) {
    console.error(
      '❌ Deposit Test Failed:',
      error.response ? error.response.data : error.message
    );
  }
}

testDeposit();
