const xrpl = require('xrpl');

async function createWallet() {
  const wallet = xrpl.Wallet.generate();
  console.log('✅ XRPL Wallet Created');
  console.log('Address:', wallet.address);
  console.log('Seed:', wallet.seed);
}

createWallet();