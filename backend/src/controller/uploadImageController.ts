import expressPkg from 'express';
import { uploadImageToGCS } from '../service/uploadImageService.ts';



// Controller xử lý upload
export const uploadImage = async (req: typeof expressPkg.request, res: typeof expressPkg.response) => {
  try {
    const file = (req as any).file; // multer memory storage
    if (!file) {
      return res.status(400).send('Chưa chọn file');
    }

    const fileBuffer = file.buffer;
    const fileName = file.originalname;

    // Gọi service upload lên GCS
    const publicUrl = await uploadImageToGCS(fileBuffer, fileName);

    res.status(200).json({
      message: 'File đã được upload thành công!',
      url: publicUrl,
    });
  } catch (error: any) {
    res.status(500).send(`Lỗi: ${error.message}`);
  }
};
