import crypto from 'crypto';
import qs from 'qs';
import moment from 'moment'; 
import Order, { IOrder, OrderStatus } from '../models/Order';
import mongoose from 'mongoose'; 
import { confirmOrderPaymentService } from './orderPaymentService';

function sortObject(obj: { [key: string]: any }): { [key: string]: string } {
    const sorted: { [key: string]: string } = {};
    const str: string[] = [];
    let key: string;

    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(key); // Push original key
        }
    }

    str.sort(); // Sort keys alphabetically

    for (let i = 0; i < str.length; i++) {
        key = str[i];
        const value = obj[key];
        // Ensure value is not null/undefined before encoding
        sorted[key] = encodeURIComponent(value !== null && value !== undefined ? value : '').replace(/%20/g, "+");
    }
    return sorted;
}


/**
 * Creates the VNPAY payment URL for a given order.
 * @param orderId - The unique ID of the order in your system.
 * @param amount - The final total amount (in VND) to be paid.
 * @param ipAddr - The client's IP address.
 * @param orderDescription - A brief description of the order.
 * @param bankCode - Optional: VNPAY bank code if pre-selected.
 * @param language - Optional: 'vn' or 'en'.
 * @returns The generated VNPAY payment URL string.
 * @throws Error if VNPAY configuration is missing.
 */
export const createVnpayUrlService = async (
    orderId: string,
    amount: number,
    ipAddr: string | string[] | undefined,
    orderDescription: string,
    bankCode?: string,
    language?: string
): Promise<string> => {
    // --- 1. Load Configuration ---
    // Ensure these are correctly set in your .env or config file
    const tmnCode = process.env.VNPAY_TMN_CODE || process.env.VNP_TMN_CODE;
    const secretKey = process.env.VNPAY_HASH_SECRET || process.env.VNP_HASH_SECRET;
    const vnpUrl = process.env.VNPAY_URL || process.env.VNP_URL;
    const vnp_IpnUrl = process.env.BACKEND_IPN_URL || process.env.VNP_IPN_URL;
    // URL your frontend will handle after payment attempt
    const returnUrl = process.env.FRONTEND_PAYMENT_RETURN_URL || process.env.VNP_RETURN_URL;
    console.log('--- Checking VNPAY ENV VARS in paymentService.ts ---');
    console.log('VNPAY_TMN_CODE:', tmnCode);
    console.log('VNPAY_HASH_SECRET:', !!secretKey);
    console.log('VNPAY_URL:', vnpUrl);
    console.log('IPN URL:', vnp_IpnUrl);
    console.log('FRONTEND_PAYMENT_RETURN_URL:', process.env.FRONTEND_PAYMENT_RETURN_URL);
    console.log('-----------------------------------------------');
    if (!tmnCode || !secretKey || !vnpUrl || !returnUrl) {
        console.error('CRITICAL: VNPAY configuration missing in environment variables.');
        throw new Error('VNPAY configuration is incomplete.');
    }

    // --- 2. Prepare Parameters ---
    process.env.TZ = 'Asia/Ho_Chi_Minh'; // Ensure correct timezone for dates
    const createDate = moment().format('YYYYMMDDHHmmss');
    const locale = (language === 'en') ? 'en' : 'vn'; // Default to Vietnamese
    const currCode = 'VND';
    const clientIp = typeof ipAddr === 'string' ? ipAddr : '127.0.0.1'; // Sanitize IP address

    let vnp_Params: { [key: string]: string | number } = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: tmnCode,
        vnp_Locale: locale,
        vnp_CurrCode: currCode,
        vnp_TxnRef: orderId, // Use your unique order ID
        vnp_OrderInfo: orderDescription || `Thanh toan don hang ${orderId}`,
        vnp_OrderType: 'other', // Or a more specific category like 'fashion', 'billpayment'
        vnp_Amount: amount * 100, // Amount MUST be multiplied by 100
        vnp_ReturnUrl: returnUrl, // Frontend URL VNPAY redirects to
        vnp_IpAddr: clientIp,
        vnp_CreateDate: createDate,
        // vnp_ExpireDate: moment().add(15, 'minutes').format('YYYYMMDDHHmmss') // Optional: Set expiry time (e.g., 15 mins)
    };

    // Add bank code only if provided (for direct bank selection)
    if (bankCode) {
        vnp_Params['vnp_BankCode'] = bankCode;
    }

    // --- 3. Sort Parameters & Create Hash ---
    console.log("VNPAY Params:", vnp_Params);
    const sortedParams = sortObject(vnp_Params); // Sort keys alphabetically
    const signData = qs.stringify(sortedParams, { encode: false }); // Create query string without encoding
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    sortedParams['vnp_SecureHash'] = signed; // Add the hash to the sorted params

    // --- 4. Construct Final URL ---
    // Use the *sorted* params with the hash added
    const finalUrl = vnpUrl + '?' + qs.stringify(sortedParams, { encode: false });

    console.log(`Generated VNPAY URL for Order ${orderId}`); // Log for debugging
    return finalUrl;
};


/**
 * Processes the Instant Payment Notification (IPN) callback from VNPAY.
 * Verifies the signature, checks order details, and calls the order confirmation service.
 * @param vnp_Params - The query parameters received from VNPAY's IPN request.
 * @returns An object `{ RspCode: string; Message: string }` according to VNPAY's IPN response requirements.
 */
export const processVnpayIpnService = async (vnp_Params: any): Promise<{ RspCode: string; Message: string }> => {
    const secretKey = process.env.VNPAY_HASH_SECRET;
    if (!secretKey) {
        console.error("CRITICAL: VNPAY_HASH_SECRET not configured for IPN verification.");
        // Even in failure, VNPAY expects a specific response format
        return { RspCode: '99', Message: 'Internal Server Error: Missing Secret Key' };
    }

    const secureHash = vnp_Params['vnp_SecureHash'];

    // --- 1. Verify Signature ---
    // Remove hash fields BEFORE sorting and hashing again
    const paramsToCheck = { ...vnp_Params };
    delete paramsToCheck['vnp_SecureHash'];
    delete paramsToCheck['vnp_SecureHashType'];

    const sortedParams = sortObject(paramsToCheck); // Sort the received params (without hash)
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const calculatedSigned = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    if (secureHash !== calculatedSigned) {
        console.error(`IPN Checksum failed for Order ${vnp_Params['vnp_TxnRef']}`);
        return { RspCode: '97', Message: 'Checksum failed' }; // VNPAY code for checksum failure
    }

    // --- 2. Extract Key Information ---
    const orderId = vnp_Params['vnp_TxnRef'];
    const rspCode = vnp_Params['vnp_ResponseCode']; // VNPAY's transaction status code
    // Amount received from VNPAY (needs division by 100)
    const vnpAmount = Number(vnp_Params['vnp_Amount']) / 100;

    // --- 3. Call Order Confirmation Logic ---
    try {
        // Find order first (outside transaction maybe, to check status quickly)
        const order = await Order.findById(orderId); // Use OrderModel or repo function
        if (!order) {
            console.error(`IPN Error: Order ${orderId} not found`);
            return { RspCode: '01', Message: 'Order not found' };
        }

        // Check amount consistency
        if (order.calculatedTotalPrice !== vnpAmount) {
             console.error(`IPN Error: Amount mismatch for order ${orderId}. Expected ${order.calculatedTotalPrice}, got ${vnpAmount}`);
             // Maybe update order status to 'AMOUNT_MISMATCH' or similar
             return { RspCode: '04', Message: 'Invalid amount' };
        }

        // Check if already processed
        if (order.isPaid || order.orderStatus === OrderStatus.CONFIRMED || order.orderStatus === OrderStatus.PROCESSING) {
            console.warn(`IPN Info: Order ${orderId} already confirmed.`);
            // Important: Return success even if already processed to prevent VNPAY retries
            return { RspCode: '00', Message: 'Order already confirmed' };
        }
        if (order.orderStatus !== OrderStatus.PENDING_PAYMENT) {
             console.warn(`IPN Info: Order ${orderId} not in PENDING_PAYMENT state (State: ${order.orderStatus}). Ignoring IPN.`);
             // Still return success to VNPAY
             return { RspCode: '00', Message: 'Order status not applicable' };
        }


        // Process based on VNPAY's response code
        if (rspCode === '00') {
            // ---- PAYMENT SUCCESSFUL ----
            console.log(`IPN: Payment successful for Order ${orderId}. Confirming order...`);
            // Call the service function that handles all updates within a transaction
            await confirmOrderPaymentService(orderId, vnp_Params);
            return { RspCode: '00', Message: 'Confirm Success' };
        } else {
            // ---- PAYMENT FAILED ----
            console.log(`IPN: Payment failed for Order ${orderId}. RspCode: ${rspCode}. Updating order status.`);
            // Update order status to indicate payment failure
            // Use repo function or direct model update
            await Order.findByIdAndUpdate(orderId, {
                $set: {
                    orderStatus: OrderStatus.PAYMENT_FAILED,
                    vnpTransactionNo: vnp_Params['vnp_TransactionNo'] // Store VNPAY ref even on failure
                }
            });
            // Still acknowledge receipt of the failure notification to VNPAY
            return { RspCode: '00', Message: 'Confirm Success' }; // Acknowledge processing the failure IPN
        }

    } catch (error: any) {
        // Catch errors from confirmOrderPaymentService or other database issues
        console.error(`CRITICAL: IPN service error for order ${orderId}:`, error);
        // Inform VNPAY of an internal error, VNPAY might retry
        return { RspCode: '99', Message: 'Internal Server Error' };
    }
};