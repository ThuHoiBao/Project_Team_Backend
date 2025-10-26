// src/repository/orderPaymentRepository.ts

import mongoose, { ClientSession, Types, HydratedDocument } from 'mongoose';
import OrderModel, { IOrder, OrderStatus, IOrderPendingItem } from '../models/Order';
import ProductSize, { IProductSize } from '../models/ProductSize';
import { Coin, ICoin}  from '../models/Coin';
import { Coupon, ICoupon } from '../models/Coupon';
import { AddressDelivery, IAddressDelivery } from '../models/AddressDelivery'; // Import IAddressDelivery if needed
import Product, { IProduct } from '../models/Product';
import { OrderItem, IOrderItem } from '../models/OrderItem';
import { CoinUsage, ICoinUsage } from '../models/coinUsage'; // Import ICoinUsage if needed
import { Payment, IPayment } from '../models/Payment';

// --- Type Definitions ---
type PopulatedProductSize = HydratedDocument<IProductSize> & {
    product: HydratedDocument<IProduct> | null;
};

// --- Read Operations ---

/**
 * Finds a specific delivery address belonging to a user.
 */
export const findAddressByUserAndId = async (
    userId: string | Types.ObjectId,
    addressId: string | Types.ObjectId,
    session?: ClientSession 
): Promise<HydratedDocument<IAddressDelivery> | null> => {
    try {
        const query = AddressDelivery.findOne({ _id: addressId, user: userId }); 
        const result = await query.exec();
        console.log('Repository: Find address result:', result ? result._id : null); 
        return result;
    } catch (error) {
        console.error(`Repository Error: Error finding address ${addressId} for user ${userId}:`, error);
        throw new Error('Database error finding address.');
    }
};

/**
 * Finds the coin balance document for a user.
 */
export const findCoinByUser = async (
    userId: string | Types.ObjectId,
    session?: ClientSession // Session optional for reads
): Promise<HydratedDocument<ICoin> | null> => {
    try {
        const query = Coin.findOne({ User: userId });
        return await query.exec();
    } catch (error) {
        console.error(`Error finding coin balance for user ${userId}:`, error);
        throw new Error('Database error finding coin balance.');
    }
};

/**
 * Finds a coupon by code AND validates its current usability (active, date range).
 * Can be used within a transaction session.
 */
export const findCouponByCode = async (
    code: string,
    session?: ClientSession // Session optional for validation reads
): Promise<HydratedDocument<ICoupon> | null> => {
    if (!code) return null; // Return null if no code provided
    const today = new Date();
    try {
        const query = Coupon.findOne({
            code: { $regex: new RegExp(`^${code.trim()}$`, 'i') },
            isActive: true,
            startDate: { $lte: today },
            endDate: { $gte: today },
            // Add $expr check for usage limit if needed here
            // $or: [ { maxUsage: { $exists: false } }, { maxUsage: null }, { $expr: { $lt: ["$usedCount", "$maxUsage"] } } ]
        });
        if (session) {
            query.session(session);
        }
        return await query.exec();
    } catch (error) {
        console.error(`Error finding or validating coupon code ${code}:`, error);
        throw new Error('Database error finding coupon.');
    }
};


/**
 * Find a specific ProductSize, populate its associated Product.
 * Used within transactions for stock checks/updates.
 */
export const findProductSizeForUpdate = async (
    productId: string | Types.ObjectId,
    size: string,
): Promise<PopulatedProductSize | null> => {
    try {
        const productSize = await ProductSize.findOne({ product: productId, size: size })
            .populate<{ product: HydratedDocument<IProduct> | null }>('product', 'price productName') // Populate necessary fields
            .exec();

        if (!productSize) return null;

        // Ensure product is populated correctly
        if (!productSize.product || typeof productSize.product !== 'object') {
             console.warn(`Product data missing for ProductSize ${productSize._id}. Product ref might be broken.`);
             (productSize as any).product = null;
        }

        return productSize as PopulatedProductSize;
    } catch (error) {
        console.error(`Error finding product size for update (Product: ${productId}, Size: ${size}):`, error);
        throw new Error('Database error finding product size for update.');
    }
};


/**
 * Find an order by ID with common populations for display or confirmation.
 */
export const findOrderById = async (orderId: string, session?: ClientSession): Promise<HydratedDocument<IOrder> | null> => {
    try {
        const query = OrderModel.findById(orderId)
            .populate('addressDelivery')
            .populate({ path: 'payment', model: 'Payment' })
            .populate('coupon')
            .populate({
                path: 'orderItems', // Populate OrderItems added after confirmation
                populate: {
                    path: 'product',
                    populate: { path: 'listImage', model: 'ImageProduct' }
                }
            });

        if (session) {
            query.session(session);
        }
        return await query.exec();
    } catch (error) {
        console.error(`Error finding order by ID ${orderId}:`, error);
        throw new Error('Database error finding order.');
    }
};

/**
 * Find an order by ID with minimal or specific populations.
 */
export const findOrderByIdOne = async (orderId: string, session?: ClientSession): Promise<HydratedDocument<IOrder> | null> => {
    try {
        const query = OrderModel.findById(orderId).populate('payment'); // Example: only populate payment
        if (session) {
            query.session(session);
        }
        return await query.exec();
    } catch (error) {
        console.error(`Error finding single order by ID ${orderId}:`, error);
        throw new Error('Database error finding order.');
    }
};


// --- Create Operations ---

/**
 * Creates a new Order document.
 */
export const createOrderRepo = async (
    orderData: Partial<IOrder>, // Use Partial<IOrder> or a specific CreateDTO
    // session: ClientSession
): Promise<HydratedDocument<IOrder>> => {
    try {
        // Alternatively, create and pass session explicitly
        const savedOrder = await OrderModel.create([orderData]);
        return savedOrder[0]; // create returns an array
    } catch (error) {
        console.error('Error creating order in repository:', error);
        throw new Error('Database error creating order.');
    }
};

/**
 * Creates a new OrderItem document.
 */
export const createOrderItemRepo = async (
    itemData: Partial<IOrderItem>, // Use Partial or specific DTO
    session: ClientSession
): Promise<HydratedDocument<IOrderItem>> => {
    try {
        const savedItem = await OrderItem.create([itemData], { session });
        return savedItem[0];
    } catch (error) {
        console.error('Error creating order item in repository:', error);
        throw new Error('Database error creating order item.');
    }
};

/**
 * Creates a new CoinUsage log document.
 */
export const createCoinUsageRepo = async (
    usageData: Partial<ICoinUsage>, // Use Partial or specific DTO
    session: ClientSession
): Promise<HydratedDocument<ICoinUsage>> => {
    try {
        const savedUsage = await CoinUsage.create([usageData], { session });
        return savedUsage[0];
    } catch (error) {
        console.error('Error creating coin usage log in repository:', error);
        throw new Error('Database error creating coin usage log.');
    }
};

/**
 * Creates a new Payment document.
 */
export const createPaymentRepo = async (
    paymentData: Partial<IPayment>, // Use Partial or specific DTO
    session: ClientSession
): Promise<HydratedDocument<IPayment>> => {
    try {
        const savedPayment = await Payment.create([paymentData], { session });
        return savedPayment[0];
    } catch (error) {
        console.error('Error creating payment record in repository:', error);
        throw new Error('Database error creating payment record.');
    }
};

export const findProductSizeForRead = async (
    productId: string | Types.ObjectId,
    size: string,
    session?: ClientSession // Session optional for general read
): Promise<PopulatedProductSize | null> => {
    try {
        const query = ProductSize.findOne({ product: productId, size: size })
            .populate<{ product: HydratedDocument<IProduct> | null }>('product', 'price productName');
        
        const productSize = await query.exec();
        
        if (!productSize) return null;

        if (!productSize.product || typeof productSize.product !== 'object') {
             console.warn(`Product data missing for ProductSize ${productSize._id}. Product ref might be broken.`);
             (productSize as any).product = null;
        }
        return productSize as PopulatedProductSize;
    } catch (error) {
        console.error(`Error finding product size for read (Product: ${productId}, Size: ${size}):`, error);
        throw new Error('Database error finding product size for read.');
    }
};

// --- Update Operations ---

/**
 * Updates stock quantity for multiple ProductSizes.
 * Uses $inc for atomic decrements.
 */
export const updateProductSizeQuantity = async (
    updates: { productId: string; size: string; quantityToDecrement: number }[],
    session: ClientSession // CRITICAL: Session required for atomicity
): Promise<void> => {
    try {
        for (const update of updates) {
            // Use findOneAndUpdate to atomically check and update, leveraging the session's isolation.
            // Note: A simpler approach for bulk is to use bulkWrite, but for a loop, findOneAndUpdate is fine.
            const updatedDoc = await ProductSize.findOneAndUpdate(
                { 
                    product: update.productId, 
                    size: update.size,
                    quantity: { $gte: update.quantityToDecrement } // CRITICAL: Ensure sufficient stock check
                },
                { $inc: { quantity: -update.quantityToDecrement } },
                { new: true, session } // Return updated document, use session
            );

            if (!updatedDoc) {
                // This will fail if the item is not found OR if quantity check ($gte) failed
                throw new Error(`CRITICAL: Stock update failed or insufficient stock found at commit for product ${update.productId}, size ${update.size}.`);
            }
        }
    } catch (error) {
        console.error('Error updating product size quantity:', error);
        if (error instanceof Error) throw error; 
        throw new Error('Database error updating stock.');
    }
};

/**
 * Updates a user's coin balance atomically using $inc.
 * Handles upsert for adding initial balance.
 */
export const updateUserCoin = async (
    userId: string | Types.ObjectId,
    amountChange: number, // Positive to add, negative to subtract
    session: ClientSession
): Promise<void> => {
    try {
        // Perform check before update if deducting
        if (amountChange < 0) {
            const coinDoc = await Coin.findOne({ User: userId });
            if (!coinDoc || coinDoc.value < Math.abs(amountChange)) {
                throw new Error(`Insufficient coin balance for user ${userId}. Available: ${coinDoc?.value ?? 0}.`);
            }
        }

        const update = { $inc: { value: amountChange } };
        const options = {
            new: true,
            upsert: amountChange >= 0, // Only upsert if adding or no change (prevents creating doc just to fail deduction)
            session
        };

        const updatedCoinDoc = await Coin.findOneAndUpdate({ User: userId }, update, options);

        if (!updatedCoinDoc && amountChange > 0) {
            throw new Error(`Failed to create or update coin balance for user ${userId}.`);
        }
        if (updatedCoinDoc && updatedCoinDoc.value < 0) {
             throw new Error(`Coin balance became negative for user ${userId}.`);
        }

    } catch (error) {
        console.error(`Error updating coin balance for user ${userId}:`, error);
        if (error instanceof Error) throw error;
        throw new Error('Database error updating coin balance.');
    }
};


/**
 * Updates a coupon's usage count and links the order ID.
 */
export const updateCouponUsageRepo = async (
    couponId: string | Types.ObjectId,
    orderId: string | Types.ObjectId,
    session: ClientSession
): Promise<void> => {
    try {
        const result = await Coupon.updateOne(
            { _id: couponId },
            {
                $inc: { usedCount: 1 },
                $set: { order: orderId } // Link this order to the coupon usage
            },
            { session }
        );

        if (result.matchedCount === 0) {
            // Log warning but don't necessarily fail transaction if coupon disappeared
            console.warn(`Coupon ${couponId} not found during usage update for order ${orderId}.`);
        }
        // No need to check modifiedCount strictly, as $inc always modifies if matched
    } catch (error) {
        console.error(`Error updating coupon usage for coupon ${couponId}:`, error);
        throw new Error('Database error updating coupon usage.');
    }
};


/**
 * Updates specific fields of an Order document.
 */
export const updateOrderRepo = async (
    orderId: string | Types.ObjectId,
    updateData: Partial<IOrder>, // Object containing fields to update
    session: ClientSession
): Promise<HydratedDocument<IOrder> | null> => {
    try {
        const updatedOrder = await OrderModel.findByIdAndUpdate(
            orderId,
            { $set: updateData }, // Use $set for clarity
            { new: true, session } // Return updated document, use session
        )
        // Optionally re-populate fields needed by the service after update
        .populate('orderItems addressDelivery payment coupon');

        if (!updatedOrder) {
             console.warn(`Order ${orderId} not found during update.`);
             // Return null if not found, consistent with findByIdAndUpdate behavior
        }
        return updatedOrder;
    } catch (error) {
        console.error(`Error updating order ${orderId}:`, error);
        throw new Error('Database error updating order.');
    }
};

/**
 * Updates only the order status.
 */
export const updateOrderStatus = async (
    orderId: string | Types.ObjectId,
    newStatus: OrderStatus,
    session?: ClientSession // Make session optional here if called outside main transaction sometimes
): Promise<HydratedDocument<IOrder> | null> => {
    try {
        const updatedOrder = await OrderModel.findByIdAndUpdate(
            orderId,
            { orderStatus: newStatus },
            { new: true, session: session }
        );
         if (!updatedOrder) {
             console.warn(`Order ${orderId} not found during status update.`);
         }
        return updatedOrder;
    } catch (error) {
        console.error(`Error updating status for order ${orderId}:`, error);
        throw new Error('Database error updating order status.');
    }
};