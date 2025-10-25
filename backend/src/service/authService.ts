import bcrypt from "bcryptjs";
import OTP from "otp-generator";
import jwt from "jsonwebtoken";
import { Coin } from "../models/Coin.js";
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

  //Loại bỏ khoảng trắng dư thừa
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();
  const trimmedFirstName = firstName.trim();
  const trimmedLastName = lastName.trim();

  // Kiểm tra các trường không được để trống
  if (!trimmedEmail) throw new Error("Email không được để trống");
  if (!trimmedPassword) throw new Error("Mật khẩu không được để trống");
  if (!trimmedFirstName) throw new Error("Họ không được để trống");
  if (!trimmedLastName) throw new Error("Tên không được để trống");

  // Kiểm tra định dạng email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    throw new Error("Email không đúng định dạng");
  }

  // Kiểm tra độ dài mật khẩu (tối thiểu 8 ký tự)
  if (trimmedPassword.length < 8) {
    throw new Error("Mật khẩu phải có ít nhất 8 ký tự");
  }

  // Kiểm tra email đã tồn tại
  if (await isEmailExist(trimmedEmail)) {

    throw new Error("Email đã được đăng ký");
  }

  // Sinh mã OTP
  const otp = OTP.generate(6, {
    digits: true,
    upperCase: false,
    specialChars: false,
  });

  // Lưu OTP và gửi mail
  otpStorage[trimmedEmail] = otp;
  await sendEmail(trimmedEmail, "Mã OTP xác nhận đăng ký", otp);

  return { message: "Mã OTP đã được gửi đến email của bạn" };
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
    await Coin.create({
      User: newUser._id,
      value: 0,
    });
    return {
      message: "OTP verified successfully. You can now create your account.",
    };
  } else {
    throw new Error("Invalid OTP");
  }
};


export const loginUserService = async (payload: {
  email: string;
  password: string;
}) => {
  const email = payload.email.trim();
  const password = payload.password.trim();

  // Kiểm tra email rỗng
  if (!email) {
    throw new Error("Email không được để trống");
  }

  // Kiểm tra định dạng email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Email không đúng định dạng");
  }

  // Kiểm tra password rỗng
  if (!password) {
    throw new Error("Mật khẩu không được để trống");
  }

  // Tìm user theo email
  const user = await findUserByEmail(email);
  if (!user) throw new Error("Không tìm thấy người dùng");

  // Kiểm tra mật khẩu
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error("Sai mật khẩu hoặc thông tin đăng nhập");

  // Sinh JWT có email + role + jti
  const jti = crypto.randomUUID();
  const payloadJwt = {
    id: user._id,
    email: user.email,
    role: user.role,
    jti,
  };

  const token = jwt.sign(payloadJwt, process.env.JWT_SECRET as string, {
    expiresIn: "1h",
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