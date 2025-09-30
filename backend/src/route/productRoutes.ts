import express from 'express';
import authenticateToken from '../middleware/authenticateToken.ts'; 
import { getProductPagination } from '../controller/searchController.ts';
import { productDetail,findProductByCategoryId, getSizebyProductId,addToWWishlist, deleteFromWishlist, 
    checkProductExistedWishlist, getWishlist
 } from '../controller/productController.ts';

const router = express.Router();

router.get('/product/search', getProductPagination );
router.get('/product/wishlist', authenticateToken, getWishlist)
router.get('/product/:id', productDetail);
router.get('/product/category/:id/:productId',findProductByCategoryId);
router.get('/product/size/:id', getSizebyProductId);
router.post('/product/wishlist/add/:id', authenticateToken, addToWWishlist)
router.delete('/product/wishlist/delete/:id', authenticateToken, deleteFromWishlist)
router.get('/product/wishlist/existed/:id', authenticateToken, checkProductExistedWishlist)
export default router;
 