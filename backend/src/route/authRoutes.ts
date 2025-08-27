// authRoutes.js
import express from 'express';
import { registerUser, loginUser, forgotPassword,verifyOtp } from '../controller/authController.ts'; // Đảm bảo import đúng cách
const router = express.Router();

// Các route sử dụng các controller
router.post('/register', registerUser);  // Đăng ký
router.post('/login', loginUser);        // Đăng nhập
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);  // Thêm route để verify OTP
export default router;
