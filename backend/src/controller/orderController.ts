// controllers/orderController.ts

import { Request, Response } from 'express';
import { getOrdersByUserId } from '../service/orderService';
import { cancelOrder } from "../service/orderService";

import asyncHandler from 'express-async-handler';
// Import the specific service function needed
import { createPreliminaryOrderService, CreateOrderPayload, finalizeOrderService } from '../service/orderPaymentService';
// Import the custom request type and PaymentMethod enum
import { AuthenticatedRequest } from '../middleware/authenticateToken'; // Adjust path if needed
import { PaymentMethod } from '../models/Payment';



export const cancelOrderController = async (req: Request, res: Response) => {
  try {
    const { userId, orderId } = req.body; // nhận từ body (hoặc req.params nếu bạn muốn)

    const order = await cancelOrder(userId, orderId);

    res.json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
    console.log(error)
  }
};
// Lấy tất cả đơn hàng của người dùng
export const getOrdersByUser = async (req: any, res: any) => {
  try {
    const userId = req.user.id; // Lấy userId từ thông tin người dùng (được xác thực trước đó)
    console.log(userId); // In ra userId để kiểm tra

    // Lấy các đơn hàng của người dùng từ database
    const orders = await getOrdersByUserId(userId);

    // Gán userId vào response trả về
    const response = {
      userId: userId,  // Thêm userId vào response
      orders: orders   // Danh sách đơn hàng
    };

    
    res.json(response);  // Trả về response với userId và danh sách đơn hàng
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};


export const createCodOrderController = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        console.log(' === COD ORDER CREATION START ===');
        
        // 1. Check Authentication
        if (!req.user || typeof req.user === 'string' || !req.user.id) {
            res.status(401).json({ 
                code: '401',
                message: 'Authentication required.' 
            });
            return;
        }

        try {
            // 2. Prepare payload
            const payload = {
                userId: req.user.id,
                orderItemsData: req.body.orderItems,
                shippingAddressId: req.body.shippingAddressId,
                paymentMethod: PaymentMethod.COD,
                couponCode: req.body.couponCode,
                coinsApplied: req.body.coinsApplied || 0,
            };

            console.log('📦 COD Payload:', JSON.stringify(payload, null, 2));

            // 3. Create preliminary order
            const { orderId, totalPrice } = await createPreliminaryOrderService(payload);
            console.log(`✅ Preliminary Order Created: ${orderId}, Total: ${totalPrice}`);

            // 4. Finalize immediately for COD
            console.log('🔄 Auto-finalizing COD order...');
            const finalizedOrder = await finalizeOrderService(orderId);
            console.log(`✅ Order Finalized: Status = ${finalizedOrder.orderStatus}`);

            // 5. Return success response
            res.status(201).json({
                code: '00',
                message: 'COD order created successfully',
                orderId: finalizedOrder.id,
                totalPrice: finalizedOrder.calculatedTotalPrice,
                orderStatus: finalizedOrder.orderStatus,
                isPaid: finalizedOrder.isPaid
            });

        } catch (error: any) {
            console.error('❌ COD Order Creation Failed:', error);
            
            res.status(500).json({
                code: '99',
                message: error.message || 'Failed to create COD order',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }
);

export const addOrderItemsController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // 1. Verify Authentication
    if (!req.user || typeof req.user === 'string' || !req.user.id) {
        res.status(401).json({ message: 'Authentication required.' });
        return; // Exit
    }
    const userId = req.user.id;

    // 2. Extract Data from Request Body
    const {
        orderItems,        // Array like [{ productId, quantity, price, size, name, image }]
        shippingAddressId, // ID string
        paymentMethod,     // String like "COD" or "VNPAY"
        couponCode,        // Optional string
        coinsApplied,      // Optional number
    } = req.body;
    console.log("📥 Controller received coinsApplied:", coinsApplied);
    // 3. Basic Validation (more detailed validation is in the service)
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
        res.status(400).json({ message: 'Order items are required.' });
        return;
    }
    if (!shippingAddressId || typeof shippingAddressId !== 'string') {
        res.status(400).json({ message: 'Shipping address ID is required.' });
        return;
    }
    if (!paymentMethod || !Object.values(PaymentMethod).includes(paymentMethod as PaymentMethod)) {
        res.status(400).json({ message: 'A valid payment method (COD or VNPAY) is required.' });
        return;
    }

    // 4. Prepare Payload for the Service
    const payload: CreateOrderPayload = {
        userId,
        // Map frontend structure if necessary, ensure productId is passed
        orderItemsData: orderItems.map((item: any) => ({
             productId: item.productId || item.id, // Handle potential variations in frontend key names
             name: item.name,
             quantity: Number(item.quantity),
             price: Number(item.price), // Price sent from frontend (service re-validates with DB price)
             size: item.size,
             image: item.image,
        })),
        shippingAddressId,
        paymentMethod: paymentMethod as PaymentMethod, // Cast to enum
        couponCode: couponCode || undefined,
        coinsApplied: Number(coinsApplied) || 0,
    };

    // 5. Call the Service and Handle Response
   try {
        // Luôn gọi hàm tạo đơn sơ bộ trước
        const result = await createPreliminaryOrderService(payload);
        const { orderId, totalPrice } = result;

        // === LOGIC MỚI: KIỂM TRA PHƯƠNG THỨC THANH TOÁN ===
        if (payload.paymentMethod === PaymentMethod.VNPAY && totalPrice > 0) {
            // 5a. VNPAY (có tính phí): Trả về JSON để frontend gọi VNPAY URL
            res.status(201).json({
                message: 'Order initiated. Proceed to payment.',
                orderId: orderId,
                totalPrice: totalPrice,
            });
        } else {
            // 5b. COD (bất kể giá) hoặc VNPAY (giá 0 đồng):
            // Hoàn tất đơn hàng ngay lập tức (trừ kho, coin, coupon, tạo payment)
            console.log(`Finalizing order immediately (Method: ${payload.paymentMethod}, Total: ${totalPrice})`);
            const finalOrder = await finalizeOrderService(orderId); // Gọi service mới

            res.status(201).json({
                message: 'Order created successfully!',
                order: finalOrder, // Trả về đơn hàng đầy đủ
                orderId: finalOrder.id,
                totalPrice: finalOrder.calculatedTotalPrice,
            });
        }
        // ============================================

    } catch (error: any) {
        // Handle errors from *both* services
        console.error('Error in addOrderItemsController:', error);
        const statusCode = error.message.includes('stock') ||
                           error.message.includes('required') ||
                           error.message.includes('Invalid') ||
                           error.message.includes('balance')
                           ? 400
                           : 500;
        res.status(statusCode).json({ message: error.message || 'Failed to create order.' });
    }
});

export const createVnpayOrderController = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        console.log('💳 === VNPAY ORDER CREATION START ===');
        
        // 1. Check Authentication
        if (!req.user || typeof req.user === 'string' || !req.user.id) {
            res.status(401).json({ 
                code: '401',
                message: 'Authentication required.' 
            });
            return;
        }

        try {
            // 2. Prepare payload
            const payload = {
                userId: req.user.id,
                orderItemsData: req.body.orderItems,
                shippingAddressId: req.body.shippingAddressId,
                paymentMethod: PaymentMethod.VNPAY,
                couponCode: req.body.couponCode,
                coinsApplied: req.body.coinsApplied || 0,
            };

            console.log('📦 VNPAY Payload:', JSON.stringify(payload, null, 2));

            // 3. Create preliminary order (NOT finalized yet)
            const { orderId, totalPrice } = await createPreliminaryOrderService(payload);
            console.log(`✅ Preliminary Order Created: ${orderId}, Total: ${totalPrice}`);

            // 4. Return order info for payment URL generation
            res.status(201).json({
                code: '00',
                message: 'Preliminary order created successfully',
                orderId: orderId,
                totalPrice: totalPrice
            });

        } catch (error: any) {
            console.error('❌ VNPAY Order Creation Failed:', error);
            
            res.status(500).json({
                code: '99',
                message: error.message || 'Failed to create preliminary order',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }
);
