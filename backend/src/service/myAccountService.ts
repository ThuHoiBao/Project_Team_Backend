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
// export const updateMyInfoService = async(id: string, payload: {firstName: string, lastName: string, 
//         address: string, phoneNumber: string}) =>{
//   const updatedUser = await updateUserInfo(id, payload);
//   if (!updatedUser) throw new Error("User not found");
//   const {password, ...restInfo} = updatedUser.toObject ? updatedUser.toObject() : updatedUser;
//   return restInfo;
// }
export const updateMyInfoService = async (
  id: string,
  payload: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  }
) => {
  // Loại bỏ khoảng trắng dư thừa
  const firstName = payload.firstName?.trim() || "";
  const lastName = payload.lastName?.trim() || "";
  const phoneNumber = payload.phoneNumber?.trim() || "";

  // Kiểm tra các trường không được để trống
  if (!firstName) throw new Error("Họ không được để trống");
  if (!lastName) throw new Error("Tên không được để trống");
  if (!phoneNumber) throw new Error("Số điện thoại không được để trống");

  // Kiểm tra họ tên chỉ chứa ký tự chữ (có hỗ trợ dấu tiếng Việt)
  const nameRegex =
    /^[A-Za-zÀ-Ỹà-ỹ\s]+$/u;
  if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
    throw new Error("Họ và tên chỉ được chứa ký tự chữ");
  }

  // Kiểm tra định dạng số điện thoại 
  const phoneRegex = /^(?:\+84|0)(3|5|7|8|9)[0-9]{8}$/;
  if (!phoneRegex.test(phoneNumber)) {
    throw new Error("Số điện thoại không đúng định dạng");
  }

  const updatedUser = await updateUserInfo(id, {
    firstName,
    lastName,
    phoneNumber,
  });

  if (!updatedUser) throw new Error("Không tìm thấy người dùng");

  // Ẩn mật khẩu khỏi kết quả trả về
  const { password, ...restInfo } = updatedUser.toObject
    ? updatedUser.toObject()
    : updatedUser;

  return restInfo;
};


// Lưu ảnh đại diện cá nhân
export const updateMyAvatarService = async(id: string, image:string) =>{
  const updatedUser = await updateMyAvatar(id, image);
  if (!updatedUser) throw new Error("User not found");
  const {password, ...restInfo} = updatedUser.toObject ? updatedUser.toObject() : updatedUser;
  return restInfo;
}
