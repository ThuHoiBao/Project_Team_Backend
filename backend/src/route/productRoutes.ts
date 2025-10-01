import express from 'express';

import { getProductPagination } from '../controller/searchController.ts';
import { productDetail,findProductByCategoryId, getSizebyProductId, getNewProductsController, getTopSellingProductsController, filterProductsController } from '../controller/productController.ts';

const router = express.Router();

router.get('/product/new', getNewProductsController);
router.get('/product/top-selling', getTopSellingProductsController);
router.get('/product/filter', filterProductsController);
router.get('/product/search', getProductPagination );
router.get('/product/:id', productDetail);
router.get('/product/category/:id',findProductByCategoryId);
router.get('/product/size/:id', getSizebyProductId);

export default router;
 