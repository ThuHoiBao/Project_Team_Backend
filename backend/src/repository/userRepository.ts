// repository/userRepository.js
import User from '../models/user.ts';

export const findUserByEmail = async (email) => {
  try {
    return await User.findOne({ email });
  } catch (error) {
    throw new Error('Error finding user by email');
  }
};

// Tạo người dùng mới và lưu vào MongoDB
export const createUser = async (userData) => {
  try {
    const newUser = new User(userData);
    await newUser.save();  // Lưu người dùng vào cơ sở dữ liệu MongoDB
    return newUser;
  } catch (error) {
    throw new Error('Error creating user');
  }
};


export const isEmailExist = async (email) => {
  try {
    return await User.exists({ email });
  } catch (error) {
    throw new Error('Error checking email existence');
  }
};
