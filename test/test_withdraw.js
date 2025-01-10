const axios = require('axios');

// 测试借款功能
async function testBorrow() {
  const apiUrl = 'http://localhost:3001/api/lending/borrow';
  const requestData = {
    amount: 10, // 测试借款金额
    userWalletAddress: 'rJsfvrHVYMoXhV67GgZdzoXGidbgQZ7b6J', // 用户钱包地址
  };

  try {
    const response = await axios.post(apiUrl, requestData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('✅ Borrow Test Successful:', response.data);
  } catch (error) {
    console.error(
      '❌ Borrow Test Failed:',
      error.response ? error.response.data : error.message
    );
  }
}

testBorrow();
