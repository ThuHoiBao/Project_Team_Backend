// controllers/coinController.js
import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { getCoinBalanceForUser, getCoinService } from '../service/coinService';
import { AuthenticatedRequest } from '../middleware/authenticateToken'; // Adjust path if needed

export const getCoinBalanceController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || typeof req.user === 'string' || !req.user.id) {
        res.status(401).json({ message: 'Authentication required, invalid user data.' });
        return; 
    }
    const userId = req.user.id;

    try {
        const coinBalance = await getCoinBalanceForUser(userId);

        res.status(200).json({
            message: 'Coin balance fetched successfully!',
            userId: userId,
            coins: coinBalance,
        });

    } catch (error: any) {
        console.error('Error in getCoinBalanceController:', error);
        res.status(500).json({ message: error.message || 'An internal server error occurred while fetching coin balance.' });
    }
});


export const getCoin = async (req: Request, res: Response) => {
    const userId = req.user.id;
    const response = await getCoinService(userId);
    try {

        if (!response.success) {
            return res.status(404).json(response);
        }
        return res.status(200).json(response);

    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }

}
