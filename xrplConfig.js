const xrpl = require('xrpl');
require('dotenv').config();

/**
 * 连接 XRPL 网络
 */
async function connectXRPL() {
  const client = new xrpl.Client(process.env.XRPL_SERVER);
  await client.connect();
  console.log(`✅ Connected to XRPL Network: ${process.env.XRPL_SERVER}`);
  return client;
}

/**
 * 获取 XRPL 钱包
 */
function getWallet() {
  return xrpl.Wallet.fromSeed(process.env.WALLET_SEED);
}

module.exports = { connectXRPL, getWallet };