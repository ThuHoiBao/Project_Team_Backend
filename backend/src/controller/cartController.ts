import { Request, Response } from 'express'; 
import { Cart } from '../models/Cart';
import { CartItem, ICartItem } from '../models/CartItem'; 
import ProductSize from '../models/ProductSize';
import { addToCartService, getCartForUser, removeItemFromCart, updateItemQuantityInCart } from '../service/cartService';
import mongoose from 'mongoose';

interface AuthenticatedRequest extends Request {
    user: {
        id: string; 
    };
}

export const addToCartController = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user.id;
    if (!userId) {
        return res.status(401).json({ message: 'Authentication required.' });
    }

    const { productId, size, quantity } = req.body;

    // Validate input cơ bản (Service cũng validate, nhưng controller nên làm trước)
    if (!productId || !size || !quantity || typeof quantity !== 'number' || quantity < 1) {
        return res.status(400).json({ message: 'Missing product ID, size, or invalid quantity.' });
    }

    try {
        // Gọi service để xử lý logic
        const savedCartItem = await addToCartService({ userId, productId, size, quantity });

        // Trả về thành công
        res.status(200).json({ message: 'Product added to cart successfully!', cartItem: savedCartItem });

    } catch (error: any) { // Bắt lỗi từ service
        console.error('Error in addToCartController:', error);

       if(error.name === 'CartError') {
            return res.status(error.status || 400).json({ message: error.message });
       }

       if(error instanceof mongoose.Error.CastError){
            return res.status(400).json({ message: 'Invalid product ID format.' });
       }
       res.status(500).json({ message: 'An internal server error occurred.' });
    }
};

export const getCartController = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Authentication required.' });
    }

    try {
        const cartItems = await getCartForUser(userId);

        res.status(200).json({
            message: 'Cart fetched successfully!',
            cartItems: cartItems // Trả về mảng cartItems đã xử lý
        });

    } catch (error: any) {
        console.error('Error in getCartController:', error);
        res.status(500).json({ message: 'An internal server error occurred while fetching the cart.' });
    }
};


export const updateCartItemController = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    console.log(`Backend: Updating Cart Item ID: ${itemId}`);
    console.log(`Backend: For User ID: ${userId}`);
    console.log(`Backend: New Quantity: ${quantity}`);

    if (!userId) return res.status(401).json({ message: 'Authentication required.' });
    if (!quantity || quantity < 1) {
        return res.status(400).json({ message: 'Invalid quantity.' });
    }
    
    try {
        const updatedItem = await updateItemQuantityInCart(itemId, quantity, userId);
        res.status(200).json({ message: 'Quantity updated.', cartItem: updatedItem });
    } catch (error: any) {
        console.error('Error in updateCartItemController:', error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Internal server error.' });
    }
};

export const removeCartItemController = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { itemId } = req.params;

    if (!userId) return res.status(401).json({ message: 'Authentication required.' });

    try {
        await removeItemFromCart(itemId, userId);
        res.status(200).json({ message: 'Item removed from cart.' });
    } catch (error: any) {
        console.error('Error in removeCartItemController:', error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Internal server error.' });
    }
};