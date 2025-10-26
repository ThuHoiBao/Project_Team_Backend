import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { OAuth2Client } from 'google-auth-library';
import User, { IUser } from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();
import { Coin } from "../models/Coin.js";

const JWT_SECRET = process.env.JWT_SECRET!;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

interface GoogleLoginResult {
  token: string;
  user: IUser;
}

export const googleLoginService = async (idToken: string): Promise<GoogleLoginResult> => {
  try {
    if (!idToken) throw new Error("No Google ID token provided");

    // VERIFY id_token với Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new Error("Invalid Google ID token");

    const { email, given_name, family_name, sub, picture } = payload;

    // Tìm hoặc tạo user
    let user = await User.findOne({
      $or: [{ googleId: sub }, { email }],
    }) as IUser | null;
    if(user && !user.status){
      return {token: "", user: user}
    }
    if (!user) {
      user = await User.create({
        firstName: given_name,
        lastName: family_name,
        email,
        image: picture,
        googleId: sub,
        provider: "google",
      }) as IUser;
      await Coin.create({
            User: user._id,
            value: 0,
          });
    } else if (!user.googleId) {
      user.googleId = sub;
      user.provider = "google";
      user.image = picture || user.image;
      user.firstName = given_name || user.firstName;
      user.lastName = family_name || user.lastName;
      await user.save();
    }

    // Sinh JWT có jti
    const payloadJwt = {
      id: user._id,
      email: user.email,
      role: user.role,
      jti: uuidv4(), //thêm jti vào payload
    };

    const token = jwt.sign(payloadJwt, JWT_SECRET as string, {
      expiresIn: "1h",
    });

    return { token, user };
  } catch (error) {
    console.error("Google login service error:", error);
    throw new Error("Google login failed");
  }
};