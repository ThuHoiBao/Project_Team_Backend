import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { getDefaultAddressForUser } from '../service/addressDeliveryService'; 
import { AuthenticatedRequest } from '../middleware/authenticateToken'; 

export const getDefaultAddressController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || typeof req.user === 'string' || !req.user.id) {
        res.status(401).json({ message: 'Authentication required, invalid user data.' });
        return;
    }
    const userId = req.user.id;

    try {
        const defaultAddress = await getDefaultAddressForUser(userId);

        if (defaultAddress) {
            res.status(200).json({
                message: 'Default address fetched successfully!',
                address: defaultAddress, // Return the address object
            });
        } else {
            // No addresses found for the user at all
            res.status(404).json({ message: 'No delivery addresses found for this user.' });
        }

    } catch (error: any) {
        console.error('Error in getDefaultAddressController:', error);
        res.status(500).json({ message: error.message || 'An internal server error occurred while fetching the address.' });
    }
});
