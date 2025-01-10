const {
    connectToXRPL,
    establishTrustLine,
    issueToken,
    burnExcessTokens,
    checkTokenBalance,
  } = require("../services/xrplService");
  
  const NETWORK = process.env.NETWORK;
  const ISSUER_SECRET = process.env.ISSUER_SECRET;
  const RECEIVING_ACCOUNT_SECRET = process.env.RECEIVING_ACCOUNT_SECRET;
  const TOKEN_CURRENCY = "CST";
  const TOKEN_AMOUNT = "10000";
  
  // Mint Tokens
  exports.mintToken = async (req, res) => {
    const { amount } = req.body;
    try {
      const client = await connectToXRPL(NETWORK);
      const issuerWallet = xrpl.Wallet.fromSeed(ISSUER_SECRET);
      await establishTrustLine(RECEIVING_ACCOUNT_SECRET, TOKEN_CURRENCY, issuerWallet.classicAddress, TOKEN_AMOUNT);
      await issueToken(ISSUER_SECRET, xrpl.Wallet.fromSeed(RECEIVING_ACCOUNT_SECRET).classicAddress, TOKEN_CURRENCY, amount || TOKEN_AMOUNT);
      res.status(200).json({ success: true, message: "Token minted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
  
  // Check Balance
  exports.getTokenBalance = async (req, res) => {
    try {
      const client = await connectToXRPL(NETWORK);
      const balance = await checkTokenBalance(RECEIVING_ACCOUNT_SECRET, TOKEN_CURRENCY, xrpl.Wallet.fromSeed(ISSUER_SECRET).classicAddress);
      res.status(200).json({ success: true, balance });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
  