// routes/orderRoutes.ts

import express from 'express';
import { getOrdersByUser } from '../controller/orderController.ts';

const router = express.Router();

// Lấy tất cả đơn hàng của người dùng
router.get('/orders/user/:userId', getOrdersByUser);

export default router;
