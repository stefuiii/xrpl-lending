const xrpl = require('xrpl');
require('dotenv').config();

async function testConnection() {
  const client = new xrpl.Client(process.env.XRPL_SERVER);
  try {
    await client.connect();
    console.log('✅ Successfully connected to XRPL server:', process.env.XRPL_SERVER);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await client.disconnect();
  }
}

testConnection();
