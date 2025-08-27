// controller/authController.js
import { registerUserService, loginUserService, forgotPasswordService, verifyOtpService } from '../service/authService.ts';

// Gửi OTP và đăng ký người dùng
export const registerUser = async (req, res) => {
  // console.log(req);
  // console.log(res);
  try {
    const response = await registerUserService(req.body);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Kiểm tra OTP khi người dùng nhập OTP
export const verifyOtp = async (req, res) => {
  try {
    const response = await verifyOtpService(req.body);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Đăng nhập người dùng
export const loginUser = async (req, res) => {
  try {
    const response = await loginUserService(req.body);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Quên mật khẩu và gửi OTP
export const forgotPassword = async (req, res) => {
  try {
    const response = await forgotPasswordService(req.body);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
