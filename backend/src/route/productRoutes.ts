import express from 'express';

import { productDetail,findProductByCategoryId } from '../controller/productController.ts';
import { getProductPagination } from '../controller/searchController.ts';

const router = express.Router();

router.get('/product/search', getProductPagination );
router.get('/product/:id', productDetail);
router.get('/product/category/:id',findProductByCategoryId);
export default router;
 