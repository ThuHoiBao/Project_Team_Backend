import { applyCouponCodeController, getAvailableCouponsController } from '../controller/couponController';
import express from 'express';

const router = express.Router();

router.get("/available", getAvailableCouponsController);
router.post("/apply", applyCouponCodeController);

export default router;
