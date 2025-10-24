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
import path from 'path';
import { fileURLToPath } from 'url';
import {seedProducts} from './seeders/product.seed.ts';
import mongoose from 'mongoose';
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
// Middleware
app.use(cors());
app.use(express.json());

// Routes
// app.use('/api',productRoutes)
app.use('/api/auth',authRoutes); 
app.use('/api',upLoadImage, productRoutes, protectedRoutes, userRoutes, imageFeedbackRoutes, feedbackRoutes, categoryRoutes)

// Route test upload form
app.get('/upload', (req, res) => {
  res.render('uploadImage'); 
});

app.use('/api', orderRoutes);
app.use("/api/feedback", feedbackRoute);
app.use("/api/notifications", notificationRoutes);
app.use('/api/cart', cartRoutes);

const server = http.createServer(app);
initSocket(server);





const PORT = process.env.PORT || 8088;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


