import express from 'express';

import { productDetail,findProductByCategoryId } from '../controller/productController.ts';

const router = express.Router();

router.get('/product/:id', productDetail);
router.get('/product/category/:id',findProductByCategoryId);
export default router;
 