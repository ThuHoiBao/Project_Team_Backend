import express from 'express';
import multer from 'multer';
import authenticateToken from '../middleware/authenticateToken.js'; // Import middleware
import { getMyInfo, updateMyInfo, uploadMyImage } from '../controller/myAccountController.ts';
import { logout } from '../controller/authController.ts';
const router = express.Router();
import { getOrdersByUser,cancelOrderController } from '../controller/orderController.ts';
// import { sendChatMessage, getChatHistory,saveSingleMessage } from "../controller/chatController";
import { sendChatMessage, getChatHistory } from "../controller/chatController";

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
router.get('/orders/user',authenticateToken, getOrdersByUser);
// Hủy đơn hàng
router.post("/orders/cancel",authenticateToken, cancelOrderController);

router.post("/chat/send-message",sendChatMessage);

// API lấy lịch sử trò chuyện của người dùng
router.get("/chat/history",authenticateToken, getChatHistory);
// router.post("/chat/save-message",authenticateToken, saveSingleMessage);
// Route upload ảnh
router.post(
  '/myinfo/upload-image',
  authenticateToken,
  upload.single('image'),
  uploadMyImage
);

router.post("/logout", authenticateToken, logout);
export default router;
