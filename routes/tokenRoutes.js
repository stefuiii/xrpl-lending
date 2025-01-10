const express = require("express");
const { mintToken, getTokenBalance } = require("../controllers/tokenController");

const router = express.Router();

router.post("/mint", mintToken);
router.get("/balance", getTokenBalance);

module.exports = router;
