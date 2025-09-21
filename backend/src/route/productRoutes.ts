import express from 'express';

import { productDetail,findProductByCategoryId, getSizebyProductId } from '../controller/productController.ts';

const router = express.Router();

router.get('/product/:id', productDetail);
router.get('/product/category/:id',findProductByCategoryId);
router.get('/product/size/:id', getSizebyProductId);
export default router;
 