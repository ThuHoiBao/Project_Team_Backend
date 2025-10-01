import { getCategoriesController } from '../controller/categoryController';
import express from 'express';

const router = express.Router();

// Lấy những feedback tốt nhất
router.get("/category", getCategoriesController);

export default router;
