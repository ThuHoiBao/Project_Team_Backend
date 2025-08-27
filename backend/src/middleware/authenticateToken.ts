import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
  // Lấy token từ header Authorization
  const token = req.headers['authorization']?.split(' ')[1]; // Lấy token từ header (Bearer token)

  if (!token) return res.status(403).json({ message: 'Token is required' });

  // Xác thực token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });

    req.user = user;  // Lưu thông tin người dùng trong request
    next();  // Tiếp tục xử lý request
  });
};

export default authenticateToken;
