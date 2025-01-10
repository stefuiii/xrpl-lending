const axios = require('axios');


async function testBorrow() {
  const apiUrl = 'http://localhost:3001/api/lending/borrow';
  const requestData = {
    amount: 5, // amount
    userWalletAddress: 'rJsfvrHVYMoXhV67GgZdzoXGidbgQZ7b6J', 
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
