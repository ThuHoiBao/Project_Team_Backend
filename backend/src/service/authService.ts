import bcrypt from "bcryptjs";
import OTP from "otp-generator";
import jwt from "jsonwebtoken";
import { RegisterUserRequestDTO } from "../dto/requestDTO/registerUserRequestDTO.ts";
import { isEmailExist, createUser, findUserByEmail, findUserById, updateUserInfo } from "../repository/userRepository.ts";

import  sendEmail  from "../utils/mailUtils.ts";  // Import mail utils

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
  const otp = OTP.generate(6, { digits: true, upperCase: false, specialChars: false });
  otpStorage[email] = otp;
  await sendEmail(email, "Your OTP code", otp);  // Chỉnh sửa thêm subject và otp
  return { message: "OTP sent to your email" };
};

/** Xác minh OTP: map DTO -> payload, hash password, lưu User */
export const verifyOtpService = async (dtoData: RegisterUserRequestDTO) => {
  const { email, password, firstName, lastName,otp } = dtoData;
  console.log(dtoData);
  console.log(email);
  console.log(password);
  console.log(firstName);
  console.log(lastName);
  console.log(otp);
  // Kiểm tra OTP
  if (otpStorage[email] === otp) {
  delete otpStorage[email];  // Xóa OTP sau khi đã kiểm tra
    const hashedPassword = await bcrypt.hash(password, 10);
    // Lưu thông tin người dùng vào MongoDB
    const newUser = await createUser({ 
      email, 
      password: hashedPassword, 
      firstName, 
      lastName 
    });
    return { message: 'OTP verified successfully. You can now create your account.' };
    
  } else {
    throw new Error('Invalid OTP');
  }

};

/** Đăng nhập */
export const loginUserService = async (payload: { email: string; password: string }) => {
  const user = await findUserByEmail(payload.email);
  if (!user) throw new Error("User not found");

  const ok = await bcrypt.compare(payload.password, user.password);
  if (!ok) throw new Error("Invalid credentials");

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
    expiresIn: "1h",
  });

  return { token };
};


// Quên mật khẩu và gửi OTP
export const forgotPasswordService = async (data) => {
  // const { email } = data;

  // const otp = OTP.generate(6, { upperCase: false, specialChars: false });

  // // Gửi OTP qua email
  // const transporter = nodemailer.createTransport({
  //   service: 'gmail',
  //   auth: {
  //     user: process.env.EMAIL_USER,
  //     pass: process.env.EMAIL_PASS,
  //   },
  // });

  // const mailOptions = {
  //   from: process.env.EMAIL_USER,
  //   to: email,
  //   subject: 'Password Reset OTP',
  //   text: `Your OTP for password reset is: ${otp}`,
  // };

  // await transporter.sendMail(mailOptions);

  // return { message: 'OTP sent to your email' };
};


// Lấy thông tin cá nhân
export const getMyInfoService = async(userId: string)=>{
  const user = await findUserById(userId);
  if (!user) throw new Error("User not found");
  // Không trả password ra ngoài
  const {password, ...restInfo} = user.toObject ? user.toObject() : user;
  return restInfo;
}

// Sửa thông tin cá nhân
export const updateMyInfoService = async(payload: {email: string, firstName: string, lastName: string, 
        address: string, phoneNumber: string}) =>{
  const updatedUser = await updateUserInfo(payload);
  if (!updatedUser) throw new Error("User not found");
  const {password, ...restInfo} = updatedUser.toObject ? updatedUser.toObject() : updatedUser;
  return restInfo;
}
