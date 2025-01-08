const xrpl = require('xrpl');
const { connectXRPL, getWallet } = require('./xrplConfig');

async function lendingPayment(sendCurrency, sendIssuer, sendAmount) {
  const client = await connectXRPL();
  const wallet = getWallet();

  try {
    const paymentTx = {
      TransactionType: 'Payment',
      Account: wallet.address,
      Destination: process.env.LENDING_POOL_ADDRESS,
      Amount: {
        currency: sendCurrency,
        issuer: sendIssuer || wallet.address,
        value: sendAmount.toString()
      }
    };

    const signed = wallet.sign(paymentTx);
    const response = await client.submitAndWait(signed.tx_blob);

    console.log('✅ Funds Transferred:', response);
    return {
      status: 'success',
      txHash: response.result.tx_json.hash,
      amountTransferred: sendAmount,
      currency: sendCurrency
    };
  } catch (error) {
    console.error('❌ Transfer Error:', error);
    throw error;
  } finally {
    await client.disconnect();
  }
}

module.exports = lendingPayment;
