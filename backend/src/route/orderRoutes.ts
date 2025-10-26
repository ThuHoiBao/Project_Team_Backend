// routes/orderRoutes.ts

import express from 'express';
import { getOrdersByUser,cancelOrderController, addOrderItemsController, createCodOrderController, createVnpayOrderController } from '../controller/orderController';
import { authenticateToken } from '../middleware/authenticateToken';

const router = express.Router();

router.post('/', authenticateToken, addOrderItemsController);
router.post('/create-cod', authenticateToken, createCodOrderController);

router.post('/create-vnpay', authenticateToken, createVnpayOrderController );
// Lấy tất cả đơn hàng của người dùng
// router.get('/orders/user/:userId', getOrdersByUser);
// // Hủy đơn hàng
// router.post("/orders/cancel", cancelOrderController);
export default router;
