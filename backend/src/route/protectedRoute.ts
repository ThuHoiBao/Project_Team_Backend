import express from 'express';
import authenticateToken from '../middleware/authenticateToken.ts'; // Import middleware
const router = express.Router();

// Route protected yêu cầu token xác thực
router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

export default router;
