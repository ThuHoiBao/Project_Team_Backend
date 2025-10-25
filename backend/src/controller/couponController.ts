import { Request, Response } from 'express';
import { Coupon } from '../models/Coupon';
import asyncHandler from 'express-async-handler';
import { getAvailableCouponsService, validateAndApplyCoupon } from '../service/couponService';

// @route   GET /api/coupons/vaailable
export const getAvailableCouponsController = asyncHandler(async (req: Request, res: Response) => {
    try {
        const availableCoupons = await getAvailableCouponsService();

        res.status(200).json({
            message: "Available coupons fetched successfully!",
            coupons: availableCoupons,
        });
    } catch (error: any) {
        res.status(500); 
        throw new Error("Failed to fetch coupons from service."); 
    }
});


export const applyCouponCodeController = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.body;

    try {
        const validCoupon = await validateAndApplyCoupon(code);

        res.status(200).json({
            message: `Coupon "${validCoupon.code}" applied successfully!`,
            coupon: validCoupon, 
        });

    } catch (error: any) {
        let statusCode = 400; 
        if (error.message.startsWith('Invalid coupon code')) {
            statusCode = 404; 
        }

        res.status(statusCode);
        throw new Error(error.message);
    }
});