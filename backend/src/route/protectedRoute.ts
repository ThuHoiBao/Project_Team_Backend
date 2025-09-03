import express from 'express';
import authenticateToken from '../middleware/authenticateToken.ts'; // Import middleware
import { getMyInfo, updateMyInfo } from '../controller/authController.ts';
const router = express.Router();

// Route protected yêu cầu token xác thực
router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// đường dẫn đến trang thông tin cá nhân
router.get('/myInfo', authenticateToken, getMyInfo);
router.put('/myinfo', authenticateToken, updateMyInfo);
export default router;
