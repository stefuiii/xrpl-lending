const express = require('express');
const { deposit, borrow, distributeRewards } = require('../controllers/lendingController');
const router = express.Router();

// 存款路由
router.post('/deposit', deposit);

// 借款路由
router.post('/borrow', borrow);

// 分发奖励路由
router.post('/distribute-rewards', distributeRewards);

module.exports = router;
