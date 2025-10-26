import express from 'express';
import authenticateToken from '../middleware/authenticateToken.js'; 
import { getProductPagination } from '../controller/searchController';
import { productDetail,findProductByCategoryId, getSizebyProductId,addToWWishlist, deleteFromWishlist, 
    checkProductExistedWishlist, getWishlist, getNewProductsController, getTopSellingProductsController, filterProductsController
 } from '../controller/productController';

const router = express.Router();

router.get('/product/new', getNewProductsController);
router.get('/product/top-selling', getTopSellingProductsController);
router.get('/product/filter', filterProductsController);
router.get('/product/search', getProductPagination );
router.get('/product/wishlist', authenticateToken, getWishlist)
router.get('/product/:id', productDetail);
router.get('/product/category/:id/:productId',findProductByCategoryId);
router.get('/product/size/:id', getSizebyProductId);
router.post('/product/wishlist/add/:id', authenticateToken, addToWWishlist)
router.delete('/product/wishlist/delete/:id', authenticateToken, deleteFromWishlist)
router.get('/product/wishlist/existed/:id', authenticateToken, checkProductExistedWishlist)
export default router;
 