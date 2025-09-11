// server.js
import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/configdb.ts';
import authRoutes from './route/authRoutes.ts';
import cors from 'cors';
import protectedRoutes from './route/protectedRoute.ts';
import upLoadImage from './route/uploadImageRoute.ts'
import path from 'path';
import { fileURLToPath } from 'url';
import {seedProducts} from './seeders/product.seed.ts';
import mongoose from 'mongoose';


// Tạo __dirname (vì dùng ES module)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const app = express();   // ✅ phải tạo app trước

// Cấu hình EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views', 'users'));

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes); 
app.use('/api',upLoadImage)
// Route test upload form
app.get('/upload', (req, res) => {
  res.render('uploadImage'); 
});

const PORT = process.env.PORT || 8088;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


