import express from 'express';
import { authenticateToken } from '../middleware/authenticateToken'; // Import auth middleware
import {
    createVnpayPaymentUrlController,
    vnpayReturnController, // Handles redirect back to frontend
    vnpayIpnHandlerController, // Handles VNPAY's server-to-server notification
    manualConfirmOrderController
} from '../controller/paymentController'; // Import payment controllers

const router = express.Router();
router.post('/confirm-order/:orderId', authenticateToken, manualConfirmOrderController);
router.post('/create_payment_url', authenticateToken, createVnpayPaymentUrlController);

router.get('/vnpay_return', vnpayReturnController);

router.get('/vnpay_ipn', vnpayIpnHandlerController);



export default router;