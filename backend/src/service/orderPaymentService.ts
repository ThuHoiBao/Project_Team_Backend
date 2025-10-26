//services/orderService
import mongoose, { Types } from 'mongoose';
import moment from 'moment';

// Make sure 'Order' is the default export from your model file
import OrderModel, { IOrder, OrderStatus, IOrderPendingItem } from '../models/Order'; // Renamed import to avoid conflict
import { OrderItem } from '../models/OrderItem';
import ProductSize from '../models/ProductSize';
import Product, { IProduct } from '../models/Product';
import { Coin } from '../models/Coin';
import { CoinUsage } from '../models/coinUsage'; // Corrected import name if needed
import { Coupon, ICoupon } from '../models/Coupon';
import { Payment, IPayment, PaymentMethod } from '../models/Payment';
import { AddressDelivery } from '../models/AddressDelivery';
import { validateAndApplyCoupon } from './couponService';
import {
     findAddressByUserAndId,
    findCoinByUser,
    findCouponByCode, // Assuming repo has this instead of calling couponService directly inside tx?
    findProductSizeForUpdate,
    findOrderById, // Used at the end of confirmation

    // Functions for creating data (Write operations)
    createOrderRepo,
    createOrderItemRepo,
    createCoinUsageRepo,
    createPaymentRepo,

    // Functions for updating data (Write operations)
    updateProductSizeQuantity,
    updateUserCoin,
    updateCouponUsageRepo, // Specific function for coupon usage
    updateOrderRepo,
    updateOrderStatus
} from "../repository/orderPaymentRepository";
import { Session } from 'inspector/promises';

export interface CreateOrderPayload {
    userId: string;
    orderItemsData: { productId: string; name: string; quantity: number; price: number; size: string; image?: string; }[];
    shippingAddressId: string;
    paymentMethod: PaymentMethod;
    couponCode?: string;
    coinsApplied: number;
}

// Interface for the result returned after creating the preliminary order
interface CreateOrderResult {
    orderId: string;
    totalPrice: number; // Final price to be paid
}

export const createPreliminaryOrderService = async (payload: CreateOrderPayload): Promise<CreateOrderResult> => {
    try {
        const { userId, orderItemsData, shippingAddressId, paymentMethod, couponCode, coinsApplied } = payload;

        console.log("🔍 Backend received payload:");
        console.log("   userId:", userId);
        console.log("   coinsApplied:", coinsApplied);
        console.log("   paymentMethod:", paymentMethod);        
        // --- 1. Validate Input & Fetch Essential Data ---
        if (!orderItemsData || orderItemsData.length === 0) throw new Error('Order must contain items.');
        if (!shippingAddressId) throw new Error('Shipping address required.');

        // Validate Shipping Address belongs to user
         const addressDoc = await findAddressByUserAndId(userId, shippingAddressId);
        if (!addressDoc) throw new Error('Invalid or unauthorized shipping address selected.')

        // Fetch User's Coin Balance
        const coinDoc = await findCoinByUser(userId);
        const currentCoinBalance = coinDoc ? coinDoc.value : 0;
        console.log("💰 Current coin balance:", currentCoinBalance);

        // --- 2. Calculate Subtotal & Validate/Prepare PendingItems ---
        let calculatedSubtotal = 0;
        const pendingItems: IOrderPendingItem[] = [];

        for (const itemData of orderItemsData) {
            const productSizeDoc = await findProductSizeForUpdate(itemData.productId, itemData.size);

            console.log('Found productSizeDoc:', productSizeDoc); 
            console.log('Populated product field:', productSizeDoc?.product);

            if (!productSizeDoc || !productSizeDoc.product || typeof productSizeDoc.product !== 'object' || !('price' in productSizeDoc.product)) {
                throw new Error(`Product details not found for ${itemData.name} (${itemData.size}).`);
            }
            if (productSizeDoc.quantity < itemData.quantity) {
                throw new Error(`Insufficient stock for ${(productSizeDoc.product as IProduct).productName} (Size: ${itemData.size}). Available: ${productSizeDoc.quantity}`);
            }

            const currentPrice = (productSizeDoc.product as IProduct).price;
            calculatedSubtotal += currentPrice * itemData.quantity;

            pendingItems.push({
                productId: new mongoose.Types.ObjectId(itemData.productId),
                productName: (productSizeDoc.product as IProduct).productName,
                size: itemData.size,
                quantity: itemData.quantity,
                price: currentPrice,
                image: itemData.image,
            });
        }

        // --- 3. Validate & Calculate Coupon Discount ---
        let calculatedDiscountValue = 0;
        let validatedCoupon: ICoupon | null = null;
        let couponIdToLink: Types.ObjectId | undefined = undefined;
        if (couponCode) {
            try {
                validatedCoupon = await validateAndApplyCoupon(couponCode);
                if (!validatedCoupon) throw new Error('Coupon not found or invalid.');
                // Calculate discount based on percentage and subtotal
                const percentageDiscount = (validatedCoupon.discountValue / 100) * calculatedSubtotal;
                let actualDiscount = percentageDiscount;
                // Apply max discount cap if it exists
                if (validatedCoupon.maxDiscount != null && validatedCoupon.maxDiscount < actualDiscount) {
                    actualDiscount = validatedCoupon.maxDiscount;
                }
                // Ensure discount doesn't exceed the subtotal
                calculatedDiscountValue = Math.min(Math.round(actualDiscount), calculatedSubtotal);
                couponIdToLink = validatedCoupon._id as Types.ObjectId;
            } catch (error: any) {
                // If coupon is invalid, ignore it but maybe log a warning
                console.warn(`Coupon validation failed during order creation: ${error.message}`);
                validatedCoupon = null; // Ensure coupon is not applied
                calculatedDiscountValue = 0;
                couponIdToLink = undefined;
            }
        }

        // --- 4. Validate & Calculate Coin Value ---
        let calculatedCoinValue = 0;
        let actualCoinsApplied = 0; // The actual number of coins to potentially deduct later
        const requestedCoins = Number(coinsApplied) || 0;
        console.log("🪙 Requested coins to apply:", requestedCoins);

        if (requestedCoins > 0) {
            // Check against fetched balance
            if (requestedCoins > currentCoinBalance) {
                throw new Error(`Insufficient coin balance. You have ${currentCoinBalance}, tried to use ${requestedCoins}.`);
            }
            // Calculate the VND value the user wants to apply
            const requestedCoinValue = requestedCoins * 1000;
            // Calculate the maximum value that *can* be applied after coupon discount
            const remainingTotalAfterDiscount = Math.max(0, calculatedSubtotal - calculatedDiscountValue);

            // The actual VND value to be covered by coins is the minimum of requested value and remaining total
            calculatedCoinValue = Math.min(requestedCoinValue, remainingTotalAfterDiscount);

            // Calculate the number of coins needed to cover this VND value (round UP)
            actualCoinsApplied = Math.ceil(calculatedCoinValue / 1000);

            // Final check: Ensure the rounded-up coins don't exceed the user's balance
            if (actualCoinsApplied > currentCoinBalance) {
                actualCoinsApplied = currentCoinBalance; // Use maximum available coins
                // Recalculate the VND value based on the actual coins used
                calculatedCoinValue = Math.min(actualCoinsApplied * 1000, remainingTotalAfterDiscount);
                actualCoinsApplied = Math.ceil(calculatedCoinValue / 1000);
            }
            // Ensure final calculated value isn't negative or unexpectedly large due to rounding
             calculatedCoinValue = Math.max(0, Math.round(calculatedCoinValue));
             actualCoinsApplied = Math.max(0, actualCoinsApplied);

        }

        // --- 5. Calculate Final Total Price ---
        const finalTotalPrice = Math.max(0, calculatedSubtotal - calculatedDiscountValue - calculatedCoinValue);

        // --- 6. Create the Preliminary Order Document ---
        const orderDataToSave = {
            user: new mongoose.Types.ObjectId(userId),
            addressDelivery: addressDoc._id as mongoose.Types.ObjectId,
            orderDate: new Date(),
            orderStatus: paymentMethod === PaymentMethod.COD ? OrderStatus.ORDERED : OrderStatus.PENDING_PAYMENT,
            pendingItems: pendingItems,
            orderItems: [], // Initially empty
            coupon: couponIdToLink, // Link coupon ID if valid
            paymentMethod: paymentMethod,
            isPaid: false,
            calculatedSubtotal: calculatedSubtotal,
            calculatedDiscountValue: calculatedDiscountValue,
            calculatedCoinsApplied: actualCoinsApplied,
            calculatedCoinValue: calculatedCoinValue,
            calculatedTotalPrice: finalTotalPrice,
        };

        const savedOrder = await createOrderRepo(orderDataToSave);

        // If COD and total is 0, finalize immediately (Optional - depends on business logic)
         if (paymentMethod === PaymentMethod.COD && finalTotalPrice === 0) {
             console.log(`COD Order ${savedOrder.id} has zero total, confirming immediately.`);
             // You *could* call confirmOrderPaymentService here, but might be simpler
             // to just update status directly if no external payment details are needed.
             // For now, we leave it as ORDERED, assuming confirmation happens on delivery/manual check.
             try {
                const finalizedOrder = await finalizeOrderService(savedOrder.id);
                
                return {
                    orderId: finalizedOrder.id,
                    totalPrice: 0,
                };
            } catch (error: any) {
                console.error('❌ Auto-finalization failed:', error);
                
                // Mark order as failed
                await updateOrderStatus(savedOrder.id, OrderStatus.PAYMENT_FAILED);
                
                throw new Error('Failed to finalize zero-total order: ' + error.message);
            }
         }

        // --- Return Result ---
        return {
            orderId: savedOrder.id, // Return the new Order ID
            totalPrice: savedOrder.calculatedTotalPrice, // Return the final price needed for payment gateway
        };

    } catch (error: any) {
        // Rollback transaction on any error
        console.error('Preliminary order creation service failed:', error);
        // Rethrow the error to be caught by the controller
        throw error; // Let controller handle specific error messages if needed
    }
};


/**
 * Confirms an order after successful payment notification (e.g., VNPAY IPN).
 * Creates OrderItems, updates stock, coins, coupons, creates Payment record within a transaction.
 * @param orderId - The ID of the order (from vnp_TxnRef).
 * @param paymentDetails - Query parameters received from VNPAY IPN.
 * @returns The fully confirmed and updated order object.
 * @throws Error if validation fails, updates fail, or order state is invalid.
 */
export const confirmOrderPaymentService = async (orderId: string, paymentDetails: any): Promise<IOrder> => {
    // ❌ REMOVE: session.startTransaction()
    // const session = await mongoose.startSession();
    // session.startTransaction();
    
    try {
        console.log('🔄 === CONFIRMING ORDER PAYMENT ===');
        console.log('Order ID:', orderId);
        
        // --- 1. Find the Preliminary Order & Validate State ---
        // ✅ REMOVE session parameter
        const order = await OrderModel.findById(orderId);
        
        if (!order) throw new Error(`Order ${orderId} not found.`);
        
        if (order.orderStatus !== OrderStatus.PENDING_PAYMENT) {
            throw new Error(`Order ${orderId} is not awaiting payment confirmation. Current status: ${order.orderStatus}`);
        }
        
        if (order.isPaid) throw new Error(`Order ${orderId} has already been paid.`);

        console.log('✅ Order found and validated');

        // --- 2. Verify VNPAY Payment Amount ---
        const vnpAmount = Number(paymentDetails['vnp_Amount']) / 100;
        console.log(`💰 Expected: ${order.calculatedTotalPrice}, Received: ${vnpAmount}`);
        
        if (order.calculatedTotalPrice !== vnpAmount) {
            throw new Error(`Amount mismatch for order ${orderId}. Expected ${order.calculatedTotalPrice}, VNPAY reported ${vnpAmount}`);
        }

        console.log('✅ Amount verified');

        // --- 3. Create Actual OrderItem Documents ---
        const orderItemIds: mongoose.Types.ObjectId[] = [];
        const productStockUpdates: { productId: string; size: string; quantityToDecrement: number }[] = [];

        if (!order.pendingItems || order.pendingItems.length === 0) {
            throw new Error(`Order ${orderId} has no pending items to confirm.`);
        }

        console.log(`📦 Creating ${order.pendingItems.length} order items...`);

        for (const itemData of order.pendingItems) {
            const productSizeDoc = await ProductSize.findOne({
                product: itemData.productId,
                size: itemData.size
            });
            
            if (!productSizeDoc || productSizeDoc.quantity < itemData.quantity) {
                throw new Error(`Insufficient stock during confirmation for ${itemData.productName} (${itemData.size}).`);
            }

            const orderItem = new OrderItem({
                order: order._id as mongoose.Types.ObjectId,
                product: itemData.productId,
                price: itemData.price,
                size: itemData.size,
                quantity: itemData.quantity,
            });

            // ✅ REMOVE session from save
            const savedOrderItem = await orderItem.save();
            orderItemIds.push(savedOrderItem._id as mongoose.Types.ObjectId);

            productStockUpdates.push({
                productId: itemData.productId.toString(),
                size: itemData.size,
                quantityToDecrement: itemData.quantity,
            });
        }

        console.log('✅ Order items created');

        // --- 4. Update ProductSize Stock ---
        console.log('📉 Updating stock...');
        
        for (const update of productStockUpdates) {
            // ✅ REMOVE session
            await ProductSize.findOneAndUpdate(
                { product: update.productId, size: update.size },
                { $inc: { quantity: -update.quantityToDecrement } },
                { new: true }
            );

            // --- 4.1. Update Product quantity ---
            await Product.findByIdAndUpdate(
                update.productId,
                { $inc: { quantity: -update.quantityToDecrement } },
                { new: true }
            );
        }

        console.log('✅ Stock updated');

        // --- 5. Update Coin Balance & Log Usage ---
        if (order.calculatedCoinsApplied > 0) {
            console.log(`🪙 Deducting ${order.calculatedCoinsApplied} coins...`);
            
            const userIdString = order.user.toString();
            const coinDoc = await Coin.findOne({ 
                User: new mongoose.Types.ObjectId(userIdString) 
            });
            
            if (!coinDoc) {
                console.error(`❌ No coin document for user ${userIdString}`);
                throw new Error(`User has no coin account. Cannot deduct ${order.calculatedCoinsApplied} coins.`);
            }

            console.log(`💰 Current balance: ${coinDoc.value}`);

            if (coinDoc.value < order.calculatedCoinsApplied) {
                throw new Error(`Insufficient coin balance. Has ${coinDoc.value}, needs ${order.calculatedCoinsApplied}`);
            }

            // ✅ REMOVE session
            const updatedCoin = await Coin.findByIdAndUpdate(
                coinDoc._id,
                { $inc: { value: -order.calculatedCoinsApplied } },
                { new: true }
            );

            if (!updatedCoin) {
                throw new Error(`Failed to update coin balance for user ${order.user}`);
            }

            console.log(`✅ New balance: ${updatedCoin.value}`);

            // Log coin usage - ✅ REMOVE session
            const coinUsageLog = new CoinUsage({
                User: new mongoose.Types.ObjectId(userIdString),
                order: order._id as mongoose.Types.ObjectId,
                coinsUsed: order.calculatedCoinsApplied,
            });
            await coinUsageLog.save();
            
            console.log(`💾 Coin usage logged`);
        }

        // --- 6. Update Coupon Usage ---
        if (order.coupon) {
            console.log('🎟️ Updating coupon usage...');
            
            // ✅ REMOVE session
            await Coupon.findByIdAndUpdate(
                order.coupon,
                { 
                    $inc: { usageCount: 1 },
                    $push: { usedBy: order._id }
                },
                { new: true }
            );
            
            console.log('✅ Coupon updated');
        }

        // --- 7. Create Payment Record ---
        console.log('💳 Creating payment record...');
        
        const paymentDate = moment(paymentDetails['vnp_PayDate'], 'YYYYMMDDHHmmss').toDate() || new Date();
        const payment = new Payment({
            order: order._id as mongoose.Types.ObjectId,
            paymentMethod: order.paymentMethod,
            paymentDate: paymentDate,
            amount: order.calculatedTotalPrice,
            coponValue: order.calculatedDiscountValue,
            status: true,
        });
        
        // ✅ REMOVE session
        const savedPayment = await payment.save();
        
        console.log('✅ Payment record created');

        // --- 8. Finalize Order Document ---
        console.log('📝 Finalizing order...');
        
        const updatedOrderData = {
            orderItems: orderItemIds,
            pendingItems: [],
            payment: savedPayment._id as mongoose.Types.ObjectId,
            isPaid: true,
            paidAt: paymentDate,
            orderStatus: OrderStatus.CONFIRMED,
            vnpTransactionNo: paymentDetails['vnp_TransactionNo'],
        };

        // ✅ REMOVE session
        const confirmedOrder = await OrderModel.findByIdAndUpdate(
            orderId,
            updatedOrderData,
            { new: true }
        );
        
        if (!confirmedOrder) throw new Error("Failed to finalize order update.");

        // ❌ REMOVE: session.commitTransaction() and session.endSession()
        
        console.log(`✅ Order ${orderId} confirmed successfully!`);
        
        // Get final order with populated fields
        const finalConfirmedOrder = await OrderModel.findById(confirmedOrder.id)
            .populate('orderItems addressDelivery payment coupon');
            
        return finalConfirmedOrder!;

    } catch (error: any) {
        // ❌ REMOVE: session.abortTransaction() and session.endSession()
        
        console.error(`❌ CRITICAL: Failed to confirm payment/finalize order ${orderId}:`, error);
        
        // Try to mark order as failed
        try {
            await OrderModel.findByIdAndUpdate(orderId, { 
                orderStatus: OrderStatus.PAYMENT_FAILED 
            });
        } catch (updateError) {
            console.error(`Failed to mark order ${orderId} as failed:`, updateError);
        }
        
        throw error;
    }
};

// ============================================
// ALSO FIX: finalizeOrderService (for COD)
// Same issue - remove transactions
// ============================================

export const finalizeOrderService = async (orderId: string): Promise<IOrder> => {
    try {
        console.log('🔄 === FINALIZING ORDER ===');
        console.log('Order ID:', orderId);
        
        // --- 1. Find Order & Validate State ---
        const order = await OrderModel.findById(orderId);

        if (!order) {
            throw new Error(`Order ${orderId} not found.`);
        }
        if (order.isPaid || order.orderItems.length > 0) {
            throw new Error(`Order ${orderId} has already been processed.`);
        }
        if (order.orderStatus !== OrderStatus.ORDERED && order.orderStatus !== OrderStatus.PENDING_PAYMENT) {
             throw new Error(`Order ${orderId} is not in a state to be finalized.`);
        }

        // --- 2. Create OrderItems from PendingItems ---
        const orderItemIds: mongoose.Types.ObjectId[] = [];
        const productStockUpdates: { productId: string; size: string; quantityToDecrement: number }[] = [];

        if (!order.pendingItems || order.pendingItems.length === 0) {
            throw new Error(`Order ${orderId} has no pending items to finalize.`);
        }

        for (const itemData of order.pendingItems) {
            const productSizeDoc = await ProductSize.findOne({
                product: itemData.productId,
                size: itemData.size,
            });

            if (!productSizeDoc || productSizeDoc.quantity < itemData.quantity) {
                throw new Error(`CRITICAL: Insufficient stock for ${itemData.productName} (${itemData.size}).`);
            }

            const orderItem = new OrderItem({
                order: order._id as mongoose.Types.ObjectId,
                product: itemData.productId,
                price: itemData.price,
                size: itemData.size,
                quantity: itemData.quantity,
            });
            const savedOrderItem = await orderItem.save();
            orderItemIds.push(savedOrderItem._id as mongoose.Types.ObjectId);

            productStockUpdates.push({
                productId: itemData.productId.toString(),
                size: itemData.size,
                quantityToDecrement: itemData.quantity,
            });
        }

        // --- 3. Update Stock ---
        for (const update of productStockUpdates) {
            await ProductSize.findOneAndUpdate(
                { product: update.productId, size: update.size },
                { $inc: { quantity: -update.quantityToDecrement } },
                { new: true }
            );

            await Product.findByIdAndUpdate(
                update.productId,
                { $inc: { quantity: -update.quantityToDecrement } },
                { new: true }
            );
        }

        // --- 4. Update Coin Balance ---
        if (order.calculatedCoinsApplied > 0) {
            const userIdString = order.user.toString();
            const coinDoc = await Coin.findOne({ 
                User: new mongoose.Types.ObjectId(userIdString)
            });
            
            if (!coinDoc) {
                throw new Error(`User has no coin account.`);
            }

            if (coinDoc.value < order.calculatedCoinsApplied) {
                throw new Error(`Insufficient coin balance.`);
            }

            await Coin.findByIdAndUpdate(
                coinDoc._id,
                { $inc: { value: -order.calculatedCoinsApplied } },
                { new: true }
            );

            const coinUsageLog = new CoinUsage({
                User: new mongoose.Types.ObjectId(userIdString),
                order: order._id as mongoose.Types.ObjectId,
                coinsUsed: order.calculatedCoinsApplied,
            });
            await coinUsageLog.save();
        }

        // --- 5. Update Coupon Usage ---
        if (order.coupon) {
            await Coupon.findByIdAndUpdate(
                order.coupon,
                { 
                    $inc: { usageCount: 1 },
                    $push: { usedBy: order._id }
                },
                { new: true }
            );
        }

        // --- 6. Create Payment Record ---
        let paymentStatus = false;
        let orderIsPaid = false;
        let orderPaidAt = undefined;
        let newOrderStatus = OrderStatus.CONFIRMED;

        if (order.calculatedTotalPrice === 0) {
            paymentStatus = true;
            orderIsPaid = true;
            orderPaidAt = new Date();
        }

        const payment = new Payment({
            order: order._id as mongoose.Types.ObjectId,
            paymentMethod: order.paymentMethod,
            paymentDate: new Date(),
            amount: order.calculatedTotalPrice,
            coponValue: order.calculatedDiscountValue,
            status: paymentStatus,
        });
        const savedPayment = await payment.save();

        // --- 7. Finalize Order Document ---
        const updateData: any = {
            orderItems: orderItemIds,
            pendingItems: [],
            payment: savedPayment._id as mongoose.Types.ObjectId,
            isPaid: orderIsPaid,
            orderStatus: newOrderStatus,
        };

        if (orderPaidAt) {
            updateData.paidAt = orderPaidAt;
        }

        const confirmedOrder = await OrderModel.findByIdAndUpdate(
            orderId,
            updateData,
            { new: true }
        );
        
        if (!confirmedOrder) throw new Error("Failed to finalize order update.");
        
        console.log(`✅ Order ${orderId} finalized successfully!`);
        
        const finalOrder = await OrderModel.findById(confirmedOrder.id)
            .populate('orderItems addressDelivery payment coupon');

        return finalOrder!;

    } catch (error: any) {
        console.error(`❌ CRITICAL: Failed to finalize order ${orderId}:`, error);
        throw error;
    }
};