// authRoutes.js
import express from 'express';
import { registerUser, loginUser, forgotPassword,verifyOtp, resetPassword, verifyOtpForReset, googleLogin } from '../controller/authController.ts'; // Đảm bảo import đúng cách
const router = express.Router();

// Các route sử dụng các controller
router.post('/register', registerUser);  // Đăng ký
router.post('/login', loginUser);        // Đăng nhập
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp); 
router.post('/verify-otp-reset', verifyOtpForReset) // Thêm route để verify OTP
router.post('/reset-password', resetPassword);
router.post("/google", googleLogin);
export default router;
