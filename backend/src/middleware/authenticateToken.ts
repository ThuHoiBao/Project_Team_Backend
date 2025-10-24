import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import InvalidatedToken from "../models/invalidatedToken.js";

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload | string; 
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "Token is required" });
  }

  jwt.verify(token, process.env.JWT_SECRET as string, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    const payload = decoded as JwtPayload;
    const jti = payload.jti;

    if (!jti) {
      return res.status(403).json({ message: "Token missing jti" });
    }

    const exists = await InvalidatedToken.exists({ id: jti });
    if (exists) {
      return res.status(403).json({ message: "Token has been revoked" });
    }

    req.user = payload;
    next();
  });
};

export default authenticateToken;
