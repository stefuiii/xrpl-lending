const express = require('express');
const { deposit, borrow, distributeRewards } = require('../controllers/lendingController');
const router = express.Router();

// deposit route
router.post('/deposit', deposit);

// borrow route
router.post('/borrow', borrow);

// issuing route
router.post('/distribute-rewards', distributeRewards);

module.exports = router;
