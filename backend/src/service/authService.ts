import bcrypt from "bcryptjs";
import OTP from "otp-generator";
import jwt from "jsonwebtoken";
import { RegisterUserRequestDTO } from "../dto/requestDTO/registerUserRequestDTO.ts";

import {
  isEmailExist,
  createUser,
  findUserByEmail,
} from "../repository/userRepository.ts";

import InvalidatedToken from "../models/invalidatedToken.ts";
import sendEmail from "../utils/mailUtils.ts"; // Import mail utils

/** Lưu OTP tạm; thực tế nên dùng Redis */
const otpStorage: Record<string, string> = {};

/** Đăng ký: kiểm tra, sinh OTP, gửi mail */
export const registerUserService = async (dtoData: RegisterUserRequestDTO) => {
  const { email, password, firstName, lastName } = dtoData;
  console.log(dtoData);
  console.log(email);
  console.log(password);
  console.log(firstName);
  console.log(lastName);
  if (!email || !password || !firstName || !lastName) {
    throw new Error("All fields are required");
  }
  if (await isEmailExist(email)) {
    throw new Error("Email is already registered");
  }
  const otp = OTP.generate(6, {
    digits: true,
    upperCase: false,
    specialChars: false,
  });
  otpStorage[email] = otp;
  await sendEmail(email, "Your OTP code", otp); // Chỉnh sửa thêm subject và otp
  return { message: "OTP sent to your email" };
};

/** Xác minh OTP: map DTO -> payload, hash password, lưu User */
export const verifyOtpService = async (dtoData: RegisterUserRequestDTO) => {
  const { email, password, firstName, lastName, otp } = dtoData;
  console.log(dtoData);
  console.log(email);
  console.log(password);
  console.log(firstName);
  console.log(lastName);
  console.log(otp);
  // Kiểm tra OTP
  if (otpStorage[email] === otp) {
    delete otpStorage[email]; // Xóa OTP sau khi đã kiểm tra
    const hashedPassword = await bcrypt.hash(password, 10);
    // Lưu thông tin người dùng vào MongoDB
    const newUser = await createUser({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });
    return {
      message: "OTP verified successfully. You can now create your account.",
    };
  } else {
    throw new Error("Invalid OTP");
  }
};

/** Đăng nhập */
export const loginUserService = async (payload: {
  email: string;
  password: string;
}) => {
  const user = await findUserByEmail(payload.email);
  if (!user) throw new Error("User not found");

  const ok = await bcrypt.compare(payload.password, user.password);
  if (!ok) throw new Error("Invalid credentials");

  const jti = crypto.randomUUID();

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
    expiresIn: "1h",
    jwtid: jti,
  });

  return { token };
};

// Quên mật khẩu và gửi OTP
export const forgotPasswordService = async (data) => {
  const { email } = data;

  const otp = OTP.generate(6, { upperCase: false, specialChars: false });
  otpStorage[email] = otp;
  await sendEmail(email, "Your OTP code", otp);
  return { message: "OTP sent to your email" };
};

export const resetPasswordService = async (data) => {
  const { email, password } = data;
  
  const user = await findUserByEmail(email);
  if (!user) throw new Error("User not found");

  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  await user.save();

  return { message: "Password changed successfully" };
};


export const verifyOtpForResetService = async (data) => {
  const { email, otp } = data;

  if (otpStorage[email] && otpStorage[email] === otp.trim()) {
    delete otpStorage[email];
    return {
      message: "OTP verified successfully. You can now reset your password.",
    };
  } else {
    throw new Error("Invalid OTP sent from service");
  }
};

export const logoutUserService = async (decodedToken) => {
  const jti = decodedToken.jti;
  const exp = decodedToken.exp * 1000; // convert to ms

  const invalidated = new InvalidatedToken({
    id: jti,
    expiryTime: new Date(exp),
  });

  await invalidated.save();
  return { message: "Logged out successfully" };
};