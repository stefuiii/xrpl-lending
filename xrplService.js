const xrpl = require('xrpl');

/**
 * 连接到 XRPL 网络
 */
async function connectXRPL() {
  const client = new xrpl.Client(process.env.XRPL_SERVER);
  await client.connect();
  console.log('✅ Successfully connected to XRPL server:', process.env.XRPL_SERVER);
  return client;
}

/**
 * 获取最新的账本索引
 * @param {xrpl.Client} client - XRPL 客户端
 * @returns {number} - 当前账本索引
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
 * 获取账户余额
 * @param {string} address - 账户地址
 * @returns {Promise<number>} - 账户余额（单位：XRP）
 */
async function getBalance(address) {
  const client = await connectXRPL();
  try {
    const accountInfo = await client.request({
      command: 'account_info',
      account: address,
      ledger_index: 'validated',
    });

    const balance = parseInt(accountInfo.result.account_data.Balance, 10) / 1000000; // 转换为 XRP
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
 * @param {number} amount - 转账金额（单位：XRP）
 * @param {string} senderAddress - 发送方地址
 * @param {string} receiverAddress - 接收方地址
 * @param {string} senderSeed - 发送方私钥
 * @returns {Promise<object>} - 转账结果
 */
async function transferXRP(amount, senderAddress, receiverAddress, senderSeed) {
  const client = await connectXRPL();
  const wallet = xrpl.Wallet.fromSeed(senderSeed);

  try {
    // 检查发送方账户余额
    const accountInfo = await client.request({
      command: 'account_info',
      account: senderAddress,
      ledger_index: 'validated',
    });

    const totalBalance = parseInt(accountInfo.result.account_data.Balance, 10) / 1000000; // 转换为 XRP
    const reserve = 10 + parseInt(accountInfo.result.account_data.OwnerCount || 0) * 2; // 储备金
    const availableBalance = totalBalance - reserve;

    console.log(`💰 Total Balance: ${totalBalance} XRP`);
    console.log(`💰 Reserve: ${reserve} XRP`);
    console.log(`💰 Available Balance: ${availableBalance} XRP`);

    if (availableBalance < amount) {
      throw new Error(`Insufficient balance: ${availableBalance} XRP available, but trying to send ${amount} XRP`);
    }

    // 检查接收方账户是否已激活
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

    // 获取最新账本索引
    const ledgerIndex = await getLedgerIndex(client);
    const lastLedgerSequence = ledgerIndex + 50; // 设置交易过期账本索引

    // 动态获取交易费用
    const feeResponse = await client.request({
      command: 'fee',
    });
    const fee = feeResponse.result.drops.minimum_fee;
    console.log(`✅ Dynamic Fee Used: ${fee} drops`);

    const sequence = accountInfo.result.account_data.Sequence;
    console.log(`✅ Account Sequence: ${sequence}`);

    // 构建交易对象
    const paymentTx = {
      TransactionType: 'Payment',
      Account: senderAddress,
      Destination: receiverAddress,
      Amount: xrpl.xrpToDrops(amount.toString()), // 转换为 drops
      Fee: fee,
      LastLedgerSequence: lastLedgerSequence,
      Sequence: sequence,
    };

    console.log('🛠️ Payment Transaction Object:', JSON.stringify(paymentTx, null, 2));

    // 签名并提交交易
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

module.exports = { connectXRPL, getLedgerIndex, getBalance, transferXRP };
