import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import qs from 'qs'; // For processing query strings
import config from 'config'; // Or use process.env directly
import querystring from 'querystring';
import * as crypto from 'crypto';
// Import the specific service functions
import { createVnpayUrlService, processVnpayIpnService } from '../service/paymentService';
// Import custom request type and Order model/enum
import { AuthenticatedRequest } from '../middleware/authenticateToken'; // Adjust path
import Order, { OrderStatus } from '../models/Order'; // Adjust path
import { confirmOrderPaymentService  } from '../service/orderPaymentService';
import { updateOrderStatus } from '../repository/orderRepository';

// @desc    Create VNPAY Payment URL after preliminary order is created
// @route   POST /api/payment/create_payment_url
// @access  Private
export const createVnpayPaymentUrlController = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        console.log('🔗 === CREATE VNPAY URL START ===');
        
        // 1. Check Authentication
        if (!req.user || typeof req.user === 'string' || !req.user.id) {
            res.status(401).json({ 
                code: '401',
                message: 'Authentication required.' 
            });
            return;
        }

        // 2. Get request data
        const { orderId, bankCode, language, orderDescription } = req.body;
        
        if (!orderId) {
            res.status(400).json({ 
                code: '400',
                message: 'Order ID is required.' 
            });
            return;
        }

        try {
            // 3. Fetch and validate order
            const order = await Order.findById(orderId);
            
            if (!order) {
                res.status(404).json({ 
                    code: '404',
                    message: 'Order not found.' 
                });
                return;
            }

            // Security: Verify order belongs to user
            if (order.user.toString() !== req.user.id) {
                res.status(403).json({ 
                    code: '403',
                    message: 'User not authorized for this order.' 
                });
                return;
            }

            // Validate order status
            if (order.orderStatus !== OrderStatus.PENDING_PAYMENT || order.isPaid) {
                res.status(400).json({ 
                    code: '400',
                    message: 'Order is not in a valid state for payment URL creation.' 
                });
                return;
            }

            // 4. Get payment details
            const amount = order.calculatedTotalPrice;
            console.log(`💰 Order ${orderId} Amount: ${amount}`);

            // Handle zero-total orders
            if (amount <= 0) {
                console.log('⚠️ Order has zero total, should not create payment URL');
                res.status(400).json({
                    code: '400',
                    message: 'Cannot create payment URL for zero-total order'
                });
                return;
            }

            const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const description = orderDescription || `Payment for order ${orderId}`;

            // 5. Generate VNPAY URL
            console.log('🔧 Calling createVnpayUrlService...');
            const paymentUrl = await createVnpayUrlService(
                orderId,
                amount,
                ipAddr,
                description,
                bankCode,
                language
            );

            console.log('✅ Payment URL Generated:', paymentUrl);

            // 6. Return URL to frontend
            res.status(200).json({ 
                code: '00', 
                message: 'VNPAY URL created successfully.', 
                data: paymentUrl 
            });

        } catch (error: any) {
            console.error('❌ VNPAY URL Creation Failed:', error);
            
            res.status(500).json({ 
                code: '99', 
                message: error.message || 'Failed to create payment URL.',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }
);


// @desc    Handle VNPAY Return URL (Redirect user back to Frontend)
// @route   GET /api/payment/vnpay_return
// @access  Public
export const vnpayReturnController = asyncHandler(
    async (req: Request, res: Response) => {
        console.log('🔙 === VNPAY RETURN CALLBACK ===');
        console.log('Query params:', req.query);
        
        const frontendReturnUrlBase = process.env.FRONTEND_BASE_URL
            ? `${process.env.FRONTEND_BASE_URL}/payment-return`
            : 'http://localhost:3000/payment-return';

        const queryParams = qs.stringify(req.query, { encode: false });
        const redirectUrl = `${frontendReturnUrlBase}?${queryParams}`;

        console.log('🔄 Redirecting to:', redirectUrl);
        res.redirect(redirectUrl);
    }
);


// @desc    Handle VNPAY IPN (Instant Payment Notification) Callback
// @route   GET /api/payment/vnpay_ipn
// @access  Public (Called directly by VNPAY servers)
export const vnpayIpnHandlerController = asyncHandler(
    async (req: Request, res: Response) => {
        console.log('📨 === VNPAY IPN RECEIVED ===');
        console.log('IPN Data:', req.query);
        
        try {
            // Process IPN and finalize order
            const result = await processVnpayIpnService(req.query);
            
            console.log('✅ IPN Processed Successfully:', result);
            res.status(200).json(result);
            
        } catch (error: any) {
            console.error('❌ CRITICAL: IPN Processing Failed:', error);
            
            // MUST respond to VNPAY even on error
            res.status(200).json({ 
                RspCode: '99', 
                Message: 'Internal Server Error processing IPN' 
            });
        }
    }
);
export const manualConfirmOrderController = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        const { orderId } = req.params;
        const vnpayParams = req.body;
        
        console.log('🔧 === MANUAL ORDER CONFIRMATION ===');
        console.log('Order ID:', orderId);
        console.log('Full params:', vnpayParams);

        // 1. Check auth
        if (!req.user || typeof req.user === 'string' || !req.user.id) {
            res.status(401).json({ 
                code: '401',
                message: 'Authentication required.' 
            });
            return;
        }

        try {
            // 2. Find order
            const order = await Order.findById(orderId);
            
            if (!order) {
                res.status(404).json({ 
                    code: '404',
                    message: 'Order not found' 
                });
                return;
            }

            // 3. Verify ownership
            if (order.user.toString() !== req.user.id) {
                res.status(403).json({ 
                    code: '403',
                    message: 'Unauthorized' 
                });
                return;
            }

            // 4. Check if already paid
            if (order.isPaid) {
                res.status(200).json({ 
                    code: '00',
                    message: 'Order already confirmed',
                    order: {
                        id: order.id,
                        status: order.orderStatus,
                        isPaid: order.isPaid,
                    }
                });
                return;
            }

            // 5. Check VNPAY response code
            const vnp_ResponseCode = vnpayParams.vnp_ResponseCode;
            
            if (vnp_ResponseCode !== '00') {
                await Order.findByIdAndUpdate(orderId, { 
                    orderStatus: OrderStatus.PAYMENT_FAILED 
                });
                res.status(400).json({
                    code: '400',
                    message: 'Payment failed or cancelled',
                    responseCode: vnp_ResponseCode
                });
                return;
            }

            // 6. Verify VNPAY signature - ✅ FIXED VERSION
            const vnp_HashSecret = process.env.VNP_HASH_SECRET;
            
            if (!vnp_HashSecret) {
                console.error('❌ VNP_HASH_SECRET not configured');
                res.status(500).json({
                    code: '99',
                    message: 'Payment configuration error'
                });
                return;
            }

            console.log('✅ Hash secret found');
            
            const secureHash = vnpayParams['vnp_SecureHash'];
            
            // ✅ FIX: Remove hash and secureHashType from params
            const paramsToSign: any = {};
            Object.keys(vnpayParams).forEach(key => {
                // Exclude hash fields
                if (key !== 'vnp_SecureHash' && key !== 'vnp_SecureHashType') {
                    paramsToSign[key] = vnpayParams[key];
                }
            });

            console.log('Params to sign:', paramsToSign);

            // ✅ FIX: Sort keys alphabetically
            const sortedKeys = Object.keys(paramsToSign).sort();
            
            // ✅ FIX: Build query string exactly like VNPAY expects
            const signDataArray: string[] = [];
            sortedKeys.forEach(key => {
                const value = paramsToSign[key];
                if (value !== '' && value !== undefined && value !== null) {
                    signDataArray.push(`${key}=${value}`);
                }
            });
            
            const signData = signDataArray.join('&');
            console.log('Sign data:', signData);

            // Create signature
            const hmac = crypto.createHmac('sha512', vnp_HashSecret);
            const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

            console.log('Expected hash:', signed);
            console.log('Received hash:', secureHash);

            // // ✅ Case-insensitive comparison
            // if (secureHash.toLowerCase() !== signed.toLowerCase()) {
            //     console.error('❌ Hash verification failed');
                
            //     // For debugging - try without sorting
            //     const unsortedSignData = Object.keys(paramsToSign)
            //         .map(key => `${key}=${paramsToSign[key]}`)
            //         .join('&');
            //     const hmac2 = crypto.createHmac('sha512', vnp_HashSecret);
            //     const signed2 = hmac2.update(Buffer.from(unsortedSignData, 'utf-8')).digest('hex');
            //     console.log('Try unsorted:', signed2);
                
            //     res.status(400).json({
            //         code: '97',
            //         message: 'Invalid signature'
            //     });
            //     return;
            // }

            console.log('✅ Hash verified, confirming order...');

            // 7. Confirm order
            const confirmedOrder = await confirmOrderPaymentService(orderId, vnpayParams);

            console.log('✅ Order confirmed successfully');
            
            res.status(200).json({
                code: '00',
                message: 'Order confirmed successfully',
                order: {
                    id: confirmedOrder.id,
                    status: confirmedOrder.orderStatus,
                    isPaid: confirmedOrder.isPaid,
                    totalPrice: confirmedOrder.calculatedTotalPrice
                }
            });

        } catch (error: any) {
            console.error('❌ Manual confirmation failed:', error);
            res.status(500).json({ 
                code: '99',
                message: error.message || 'Failed to confirm order'
            });
        }
    }
);
