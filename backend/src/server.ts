// server.js
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import connectDB from './config/configdb';
import authRoutes from './route/authRoutes';
import cors from 'cors';
import protectedRoutes from './route/protectedRoute';
import upLoadImage from './route/uploadImageRoute'
import productRoutes from './route/productRoutes'
import userRoutes from './route/userRoutes'
import orderRoutes from './route/orderRoutes'
import imageFeedbackRoutes from './route/imageFeedbackRoutes'
import feedbackRoutes from './route/feedbackRoute'
import feedbackRoute from './route/feedbackRoutes'
import categoryRoutes from './route/categoryRoutes'
import notificationRoutes from "./route/notificationRoutes";
import coinRoutes from "./route/coinRoutes";
import path from 'path';
import { fileURLToPath } from 'url';
import {seedProducts} from './seeders/product.seed';
import mongoose from 'mongoose';
import chatRoutes from "./route/chatRoutes";  // Import routes
import http from "http";
import "./models/Category";
import "./models/Product";
import "./models/ImageProduct.ts";
import "./models/Feedback.ts";
import { Server } from 'http';
import { initSocket } from "./socket";
import cartRoutes from './route/cartRoutes';
import couponRoutes from './route/couponRoutes';
import addressDeliveryRoutes from './route/addressDeliveryRoutes.js';
import paymentRoutes from './route/paymentRoutes.js';
// Tạo __dirname (vì dùng ES module)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


connectDB();

const app = express();  

// Cấu hình EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views', 'users'));

// 1. Cấu hình CORS đầy đủ
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:4000',
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Cho phép
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600,
};

app.use(cors(corsOptions));

// 2. Thêm security headers cho Google OAuth
app.use((req, res, next) => {
  // Quan trọng cho Google One Tap
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  
  // Security headers khác (tùy chọn nhưng nên có)
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
});

// Middleware
app.use(express.json());

// Routes
// app.use('/api',productRoutes)
app.use('/api/auth',authRoutes); 
app.use('/api',upLoadImage, productRoutes, protectedRoutes, userRoutes, imageFeedbackRoutes, feedbackRoutes, categoryRoutes, coinRoutes)

// Route test upload form
app.get('/upload', (req, res) => {
  res.render('uploadImage'); 
});

app.use('/api', orderRoutes);
app.use("/api/feedback", feedbackRoute);
app.use("/api/notifications", notificationRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/coins', coinRoutes);
app.use("/api/chat", chatRoutes);  // Đăng ký route
app.use('/api/coupons', couponRoutes);
app.use('/api/addresses', addressDeliveryRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', orderRoutes);
const server = http.createServer(app);
initSocket(server);


const PORT = process.env.PORT || 8088;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


