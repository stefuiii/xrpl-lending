const xrpl = require('xrpl');

/**
 * Connect to XRPL Testnet
 */
async function connectXRPL() {
  const client = new xrpl.Client(process.env.XRPL_SERVER);
  await client.connect();
  console.log('✅ Successfully connected to XRPL server:', process.env.XRPL_SERVER);
  return client;
}

/**
 * Get transaction index
 * @param {xrpl.Client} client
 * @returns {number} 
 */
async function getLedgerIndex(client) {
  try {
    const ledger = await client.request({
      command: 'ledger',
      ledger_index: 'validated',
    });
    const ledgerIndex = ledger.result.ledger_index;
    console.log('✅ Current Ledger Index:', ledgerIndex);
    return ledgerIndex;
  } catch (error) {
    console.error('❌ Failed to fetch ledger index:', error.message);
    throw error;
  }
}

/**
 * Get balance
 * @param {string} address 
 * @returns {Promise<number>} 
 */
async function getBalance(address) {
  const client = await connectXRPL();
  try {
    const accountInfo = await client.request({
      command: 'account_info',
      account: address,
      ledger_index: 'validated',
    });

    const balance = parseInt(accountInfo.result.account_data.Balance, 10) / 1000000; 
    console.log(`✅ Account Balance for ${address}: ${balance} XRP`);
    return balance;
  } catch (error) {
    console.error('❌ Balance Check Error:', error.message);
    throw error;
  } finally {
    await client.disconnect();
    console.log('🔌 Disconnected from XRPL server');
  }
}

/**
 * 转账操作
 * @param {number} amount 
 * @param {string} senderAddress 
 * @param {string} receiverAddress
 * @param {string} senderSeed
 * @returns {Promise<object>}
 */
async function transferXRP(amount, senderAddress, receiverAddress, senderSeed) {
  const client = await connectXRPL();
  const wallet = xrpl.Wallet.fromSeed(senderSeed);

  try {
    const accountInfo = await client.request({
      command: 'account_info',
      account: senderAddress,
      ledger_index: 'validated',
    });

    const totalBalance = parseInt(accountInfo.result.account_data.Balance, 10) / 1000000;
    const reserve = 10 + parseInt(accountInfo.result.account_data.OwnerCount || 0) * 2;
    const availableBalance = totalBalance - reserve;

    console.log(`💰 Total Balance: ${totalBalance} XRP`);
    console.log(`💰 Reserve: ${reserve} XRP`);
    console.log(`💰 Available Balance: ${availableBalance} XRP`);

    if (availableBalance < amount) {
      throw new Error(`Insufficient balance: ${availableBalance} XRP available, but trying to send ${amount} XRP`);
    }

    // Check activity
    try {
      await client.request({
        command: 'account_info',
        account: receiverAddress,
        ledger_index: 'validated',
      });
      console.log(`✅ Receiver Account is Activated: ${receiverAddress}`);
    } catch (error) {
      if (error.data && error.data.error === 'actNotFound') {
        throw new Error('Receiver account is not activated. Send at least 10 XRP to activate it.');
      } else {
        throw error;
      }
    }

    const ledgerIndex = await getLedgerIndex(client);
    const lastLedgerSequence = ledgerIndex + 50; // set expiry index

    // get fee
    const feeResponse = await client.request({
      command: 'fee',
    });
    const fee = feeResponse.result.drops.minimum_fee;
    console.log(`✅ Dynamic Fee Used: ${fee} drops`);

    const sequence = accountInfo.result.account_data.Sequence;
    console.log(`✅ Account Sequence: ${sequence}`);

    // Transaction object
    const paymentTx = {
      TransactionType: 'Payment',
      Account: senderAddress,
      Destination: receiverAddress,
      Amount: xrpl.xrpToDrops(amount.toString()), 
      Fee: fee,
      LastLedgerSequence: lastLedgerSequence,
      Sequence: sequence,
    };

    console.log('🛠️ Payment Transaction Object:', JSON.stringify(paymentTx, null, 2));

    // Sign and submit
    const signed = wallet.sign(paymentTx);
    console.log('🛠️ Signed Transaction:', signed);

    const response = await client.submitAndWait(signed.tx_blob);
    console.log('🛠️ XRPL Response:', JSON.stringify(response, null, 2));

    if (response.result.meta.TransactionResult === 'tesSUCCESS') {
      console.log('✅ Transaction Successful:', response.result.hash);
      return { success: true, txHash: response.result.hash };
    } else {
      console.error('❌ XRPL Error:', response.result.meta.TransactionResult);
      return { success: false, error: response.result.meta.TransactionResult };
    }
  } catch (error) {
    console.error('❌ Transaction Error:', error.message);
    console.error('❌ Full Error:', JSON.stringify(error, null, 2));
    throw error;
  } finally {
    await client.disconnect();
    console.log('🔌 Disconnected from XRPL server');
  }
}

/**
 * Establish a Trust Line
 * @param {string} accountSecret - Account seed
 * @param {string} currency - Token currency code
 * @param {string} issuerAddress - Issuer's XRPL account address
 * @param {string} limitAmount - Trust line limit amount
 * @returns {Promise<object>} - Trust line creation result
 */
async function establishTrustLine(accountSecret, currency, issuerAddress, limitAmount) {
  const client = await connectXRPL();
  const wallet = xrpl.Wallet.fromSeed(accountSecret);

  try {
    const trustSetTx = {
      TransactionType: 'TrustSet',
      Account: wallet.classicAddress,
      LimitAmount: {
        currency: currency,
        issuer: issuerAddress,
        value: limitAmount,
      },
    };

    const preparedTx = await client.autofill(trustSetTx);
    const signedTx = wallet.sign(preparedTx);
    const result = await client.submitAndWait(signedTx.tx_blob);

    console.log('✅ Trust Line Established:', result);
    return result;
  } catch (error) {
    console.error('❌ Trust Line Error:', error.message);
    throw error;
  } finally {
    await client.disconnect();
    console.log('🔌 Disconnected from XRPL server');
  }
}


/**
* Issue Tokens
* @param {string} issuerSecret - Issuer's wallet seed
* @param {string} recipientAddress - Recipient's XRPL account address
* @param {string} currency - Token currency code
* @param {string} amount - Token amount
* @returns {Promise<object>} - Token issuance result
*/
async function issueToken(issuerSecret, recipientAddress, currency, amount) {
 const client = await connectXRPL();
 const issuerWallet = xrpl.Wallet.fromSeed(issuerSecret);

 try {
   const paymentTx = {
     TransactionType: 'Payment',
     Account: issuerWallet.classicAddress,
     Destination: recipientAddress,
     Amount: {
       currency: currency,
       issuer: issuerWallet.classicAddress,
       value: amount,
     },
   };

   const preparedTx = await client.autofill(paymentTx);
   const signedTx = issuerWallet.sign(preparedTx);
   const result = await client.submitAndWait(signedTx.tx_blob);

   console.log('✅ Token Issued:', result);
   return result;
 } catch (error) {
   console.error('❌ Token Issuance Error:', error.message);
   throw error;
 } finally {
   await client.disconnect();
   console.log('🔌 Disconnected from XRPL server');
 }
}

/**
* Burn Excess Tokens
* @param {string} accountSecret - Account seed
* @param {string} issuerAddress - Issuer's XRPL account address
* @param {string} currency - Token currency code
* @param {string} amount - Token amount to burn
* @returns {Promise<object>} - Token burn result
*/
async function burnExcessTokens(accountSecret, issuerAddress, currency, amount) {
 const client = await connectXRPL();
 const wallet = xrpl.Wallet.fromSeed(accountSecret);

 try {
   const paymentTx = {
     TransactionType: 'Payment',
     Account: wallet.classicAddress,
     Destination: issuerAddress,
     Amount: {
       currency: currency,
       issuer: issuerAddress,
       value: amount,
     },
   };

   const preparedTx = await client.autofill(paymentTx);
   const signedTx = wallet.sign(preparedTx);
   const result = await client.submitAndWait(signedTx.tx_blob);

   console.log(`✅ Burned ${amount} tokens.`);
   return result;
 } catch (error) {
   console.error('❌ Token Burn Error:', error.message);
   throw error;
 } finally {
   await client.disconnect();
   console.log('🔌 Disconnected from XRPL server');
 }
}

/**
* Check Token Balance
* @param {string} accountSecret - Account seed
* @param {string} currency - Token currency code
* @param {string} issuerAddress - Issuer's XRPL account address
* @returns {Promise<string>} - Token balance
*/
async function checkTokenBalance(accountSecret, currency, issuerAddress) {
 const client = await connectXRPL();
 const wallet = xrpl.Wallet.fromSeed(accountSecret);

 try {
   const accountLines = await client.request({
     command: 'account_lines',
     account: wallet.classicAddress,
   });

   const tokenLine = accountLines.result.lines.find(
     (line) => line.currency === currency && line.account === issuerAddress
   );

   const balance = tokenLine ? tokenLine.balance : '0';
   console.log(`✅ Token Balance for ${wallet.classicAddress}: ${balance} ${currency}`);
   return balance;
 } catch (error) {
   console.error('❌ Token Balance Error:', error.message);
   throw error;
 } finally {
   await client.disconnect();
   console.log('🔌 Disconnected from XRPL server');
 }
}

module.exports = {
  connectXRPL,
  getLedgerIndex,
  getBalance,
  transferXRP,
  establishTrustLine,
  issueToken,
  burnExcessTokens,
  checkTokenBalance,
};
