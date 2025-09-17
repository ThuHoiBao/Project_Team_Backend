import expressPkg from 'express';
import { uploadImageToGCS } from '../service/uploadImageService.ts';
import { updateMyAvatarService } from '../service/myAccountService.ts';
import {
  getMyInfoService, 
  updateMyInfoService
} from "../service/myAccountService.ts";

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
    const { id } = req.user;
    const {email, ...userInfo} = req.body;
    const updatedUser = await updateMyInfoService(id, userInfo);
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

export const uploadMyImage = async (req: typeof expressPkg.request, res: typeof expressPkg.response) => {
  try {
    const file = (req as any).file; // Multer memory storage
    if (!file) {
      return res.status(400).send('Chưa chọn file');
    }

    // Lấy user id từ token (đã được gắn ở middleware authenticateToken)
    const { id } = (req as any).user;
    if (!id) {
      return res.status(403).json({ message: 'Không tìm thấy user id trong token' });
    }

    const fileBuffer = file.buffer;

    // Đặt lại tên file = user_id.png
    const fileName = `user_${id}.png`;

    // Gọi service upload lên GCS
    const publicUrl = await uploadImageToGCS(fileBuffer, fileName);
    // Lưu avatar vào user
    const updatedUser = await updateMyAvatarService(id,publicUrl);

    res.status(200).json({
      message: 'File đã được upload thành công!',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).send(`Lỗi: ${error.message}`);
  }
};

