const axios = require('axios');

async function testDeposit() {
  const apiUrl = 'http://localhost:3001/api/lending/deposit';
  const requestData = {
    amount: 10,
    userWalletAddress: 'rJsfvrHVYMoXhV67GgZdzoXGidbgQZ7b6J',
    userWalletSeed: 'sEdTG5TKBRCAG69LVDsfpa2N1M9fhUx'
  };

  try {
    const response = await axios.post(apiUrl, requestData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('✅ Deposit Test Successful:', response.data);
  } catch (error) {
    console.error('❌ Deposit Test Failed:', error.response ? error.response.data : error.message);
  }
}

testDeposit();
