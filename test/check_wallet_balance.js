const xrpl = require('xrpl');
require('dotenv').config();

async function checkBalance() {
  const client = new xrpl.Client(process.env.XRPL_SERVER);
  await client.connect();

  const accountInfo = await client.request({
    command: 'account_info',
    account: process.env.LENDING_POOL_ADDRESS,
    ledger_index: 'validated'
  });

  console.log('✅ Wallet Balance:', accountInfo.result.account_data.Balance / 1000000, 'XRP');
  await client.disconnect();
}

checkBalance();