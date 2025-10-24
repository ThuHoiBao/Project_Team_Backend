// routes/orderRoutes.ts

import express from 'express';
import { getOrdersByUser,cancelOrderController } from '../controller/orderController.ts';

const router = express.Router();

// Lấy tất cả đơn hàng của người dùng
// router.get('/orders/user/:userId', getOrdersByUser);
// // Hủy đơn hàng
// router.post("/orders/cancel", cancelOrderController);
export default router;
