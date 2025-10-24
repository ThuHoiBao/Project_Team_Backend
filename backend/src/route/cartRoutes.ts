import express from 'express';
import { addToCartController, getCartController, removeCartItemController, updateCartItemController } from '../controller/cartController';
import { authenticateToken } from '../middleware/authenticateToken';   
const router = express.Router();

router.post('/', authenticateToken as any, addToCartController as any);
router.get('/', authenticateToken as any, getCartController as any);
router.patch('/:itemId', authenticateToken, updateCartItemController); 
router.delete('/:itemId', authenticateToken, removeCartItemController);
export default router;