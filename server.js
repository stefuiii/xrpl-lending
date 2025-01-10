const express = require('express');
const lendingRoutes = require('./routes/lendingRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());

// 注册 Lending 路由
app.use('/api/lending', lendingRoutes);

// 启动服务器
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ API Server running at http://localhost:${PORT}`);
});
