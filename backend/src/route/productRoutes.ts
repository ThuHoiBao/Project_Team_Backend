import express from 'express';

import { getProductPagination } from '../controller/searchController.ts';
import { productDetail,findProductByCategoryId, getSizebyProductId } from '../controller/productController.ts';

const router = express.Router();

router.get('/product/search', getProductPagination );
router.get('/product/:id', productDetail);
router.get('/product/category/:id',findProductByCategoryId);
router.get('/product/size/:id', getSizebyProductId);
export default router;
 