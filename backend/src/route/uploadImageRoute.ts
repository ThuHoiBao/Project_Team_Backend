import express from 'express';
import multer from 'multer';
import { uploadImage } from '../controller/uploadImageController.ts';

const router = express.Router();

// Sử dụng memory storage để multer không tạo file tạm
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route upload ảnh
router.post('/upload-image', upload.single('image'), uploadImage);

export default router;
