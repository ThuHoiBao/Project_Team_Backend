// server.js
import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/configdb.ts';
import authRoutes from './route/authRoutes.ts';
import cors from 'cors';
import protectedRoutes from './route/protectedRoute.ts';
import upLoadImage from './route/uploadImageRoute.ts'
import productRoutes from './route/productRoutes.ts'
import userRoutes from './route/userRoutes.ts'
import orderRoutes from './route/orderRoutes.ts'
import imageFeedbackRoutes from './route/imageFeedbackRoutes.ts'
import feedbackRoutes from './route/feedbackRoute.ts'
import feedbackRoute from './route/feedbackRoutes.ts'
import categoryRoutes from './route/categoryRoutes.ts'
import notificationRoutes from "./route/notificationRoutes";
import coinRoutes from "./route/coinRoutes";
import path from 'path';
import { fileURLToPath } from 'url';
import {seedProducts} from './seeders/product.seed.ts';
import mongoose from 'mongoose';
import chatRoutes from "./route/chatRoutes";  // Import routes
import http from "http";
import "./models/Category";
import "./models/Product";
import "./models/ImageProduct.ts";
import "./models/Feedback.ts";
import { Server } from 'http';
import { initSocket } from "./socket";
import cartRoutes from './route/cartRoutes.js';


// Tạo __dirname (vì dùng ES module)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
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
app.use("/api/chat", chatRoutes);  // Đăng ký route
const server = http.createServer(app);
initSocket(server);


const PORT = process.env.PORT || 8088;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


