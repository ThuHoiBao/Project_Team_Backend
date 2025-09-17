import {
  findUserById, 
  updateUserInfo,
  updateMyAvatar
} from "../repository/userRepository.ts";

// Lấy thông tin cá nhân
export const getMyInfoService = async(userId: string)=>{
  const user = await findUserById(userId);
  if (!user) throw new Error("User not found");
  // Không trả password ra ngoài
  const {password, ...restInfo} = user.toObject ? user.toObject() : user;
  return restInfo;
}

// Sửa thông tin cá nhân
export const updateMyInfoService = async(id: string, payload: {firstName: string, lastName: string, 
        address: string, phoneNumber: string}) =>{
  const updatedUser = await updateUserInfo(id, payload);
  if (!updatedUser) throw new Error("User not found");
  const {password, ...restInfo} = updatedUser.toObject ? updatedUser.toObject() : updatedUser;
  return restInfo;
}

// Lưu ảnh đại diện cá nhân
export const updateMyAvatarService = async(id: string, image:string) =>{
  const updatedUser = await updateMyAvatar(id, image);
  if (!updatedUser) throw new Error("User not found");
  const {password, ...restInfo} = updatedUser.toObject ? updatedUser.toObject() : updatedUser;
  return restInfo;
}
