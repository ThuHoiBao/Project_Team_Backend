// controller/authController.js

import {
  registerUserService,
  loginUserService,
  forgotPasswordService,
  verifyOtpService,
  resetPasswordService,
  verifyOtpForResetService,
  getMyInfoService, 
  updateMyInfoService
} from "../service/authService.ts";


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

export const verifyOtpForReset = async (req, res) => {
  try {
    const response = await verifyOtpForResetService(req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}
// Đăng nhập người dùng
export const loginUser = async (req, res) => {
  try {
    const response = await loginUserService(req.body);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//
// Quên mật khẩu và gửi OTP
export const forgotPassword = async (req, res) => {
  try {
    const response = await forgotPasswordService(req.body);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const response = await resetPasswordService(req.body);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin cá nhân
export const getMyInfo = async (req, res)=>{
  try{
    const userId = req.user.id
    const response = await getMyInfoService(userId);
    res.json(response)
  }
  catch (error) {
    console.error("Error updating user:", error.message);

    if (error.message) {
      return res.status(404).json({ message: error.message });
    }

    // Lỗi khác
    return res.status(500).json({ message: "Server error" });
  }
}

// Chỉnh sửa thông tin cá nhân
export const updateMyInfo = async(req, res) =>{
  try{
    const userInfo = req.body;
    const updatedUser = await updateMyInfoService(userInfo);
    res.json(updatedUser);
  }catch (error) {
    console.error("Error updating user:", error.message);

    if (error.message) {
      return res.status(404).json({ message: error.message });
    }

    // Lỗi khác
    return res.status(500).json({ message: "Server error" });
  }
}
