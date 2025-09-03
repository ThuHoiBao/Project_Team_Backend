// repository/userRepository.js
import User from '../models/user.ts';

export const findUserByEmail = async (email) => {
  try {
    return await User.findOne({ email });
  } catch (error) {
    throw new Error('Error finding user by email');
  }
};

export const findUserById = async (id) => {
  try{
    return await User.findById(id);
  } catch (error) {
    throw new Error('Error finding user by email');
  }
}

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

export const updateUserInfo = async ({ email, ...updateData }) =>{
  try{
     const updatedUser = await User.findOneAndUpdate(
      { email },         // điều kiện tìm kiếm
      updateData,        // data update (không có email)
      { new: true, runValidators: true } //thêm new: true, thì nó sẽ trả về document sau khi update.
    );
    return updatedUser;
  }catch (error) {
    throw new Error('Error updating user');
  }
}


export const isEmailExist = async (email) => {
  try {
    return await User.exists({ email });
  } catch (error) {
    throw new Error('Error checking email existence');
  }
};
