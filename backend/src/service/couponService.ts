import { Coupon, ICoupon } from '../models/Coupon';


export const getAvailableCouponsService = async (): Promise<ICoupon[]> => {
    const today = new Date();

    const availableCoupons = await Coupon.find({
        isActive: true,
        startDate: { $lte: today },
        endDate: { $gte: today },
    }).sort({ endDate: 1 }); 

    return availableCoupons;
};


export const validateAndApplyCoupon = async (code: string): Promise<ICoupon> => {
    if (!code || typeof code !== 'string') {
        throw new Error('Coupon code is required.'); 
    }

    const today = new Date();

    const coupon = await Coupon.findOne({
        code: { $regex: new RegExp(`^${code.trim()}$`, 'i') }
    });

    if (!coupon) {
        throw new Error(`Invalid coupon code: "${code}".`); 
    }

    if (!coupon.isActive) {
        throw new Error(`Coupon "${code}" is currently inactive.`);
    }
    if (coupon.startDate > today) {
        throw new Error(`Coupon "${code}" is not yet active.`);
    }
    if (coupon.endDate < today) {
        throw new Error(`Coupon "${code}" has expired.`);
    }

    return coupon;
};