import express from 'express';
import multer from 'multer';
import authenticateToken from '../middleware/authenticateToken.ts'; // Import middleware
import { getMyInfo, updateMyInfo, uploadMyImage } from '../controller/myAccountController.ts';
import { logout } from '../controller/authController.ts';
const router = express.Router();

// Sử dụng memory storage để multer không tạo file tạm
const storage = multer.memoryStorage();
const upload = multer({ storage });


// Route protected yêu cầu token xác thực
router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// đường dẫn đến trang thông tin cá nhân
router.get('/myInfo', authenticateToken, getMyInfo);
router.put('/myinfo', authenticateToken, updateMyInfo);
// Route upload ảnh
router.post(
  '/myinfo/upload-image',
  authenticateToken,
  upload.single('image'),
  uploadMyImage
);

router.post("/logout", authenticateToken, logout);
export default router;
