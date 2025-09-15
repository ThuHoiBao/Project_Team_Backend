import jwt, { JwtPayload } from "jsonwebtoken";
import InvalidatedToken from "../models/invalidatedToken.js";

const authenticateToken = (req, res, next) => {
  // Lấy token từ header Authorization
  const token = req.headers['authorization']?.split(' ')[1]; // Lấy token từ header (Bearer token)

  if (!token) return res.status(403).json({ message: 'Token is required' });

  // Xác thực token
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });

    const payload = decoded as JwtPayload; // ép kiểu để lấy jti
    const jti = payload.jti;
    if (!jti) {
      return res.status(403).json({ message: "Token missing jti" });
    }


    // Kiểm tra token đã bị vô hiệu hóa chưa
      const exists = await InvalidatedToken.exists({ id: jti });
      if (exists) {
        return res.status(403).json({ message: "Token has been revoked" });
      }


    req.user = payload;  // Lưu thông tin người dùng trong request
    next();  // Tiếp tục xử lý request
  });
};

export default authenticateToken;
