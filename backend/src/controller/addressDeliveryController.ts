import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { getDefaultAddressForUser, 
        getAllAddressesForUser,
        setDefaultAddressForUser,
        addAddressForUser,
        updateAddressForUser}
     from '../service/addressDeliveryService'; 
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
                address: defaultAddress, 
            });
        } else {
            res.status(404).json({ message: 'No delivery addresses found for this user.' });
        }

    } catch (error: any) {
        console.error('Error in getDefaultAddressController:', error);
        res.status(500).json({ message: error.message || 'An internal server error occurred while fetching the address.' });
    }
});

export const getAllAddressesController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || typeof req.user === 'string' || !req.user.id) {
        res.status(401).json({ message: 'Authentication required.' }); return;
    }
    const userId = req.user.id;

    try {
        const addresses = await getAllAddressesForUser(userId);
        res.status(200).json({
            message: 'Addresses fetched successfully!',
            addresses: addresses, 
        });
    } catch (error: any) {
        console.error('Error in getAllAddressesController:', error);
        res.status(500).json({ message: error.message || 'Server error fetching addresses.' });
    }
});

export const setDefaultAddressController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || typeof req.user === 'string' || !req.user.id) {
        res.status(401).json({ message: 'Authentication required.' }); return;
    }
    const userId = req.user.id;
    const addressId = req.params.id; 

    if (!addressId) {
        res.status(400).json({ message: 'Address ID is required.' }); return;
    }

    try {
        const updatedAddress = await setDefaultAddressForUser(userId, addressId);
        res.status(200).json({
            message: 'Default address updated successfully!',
            address: updatedAddress,
        });
    } catch (error: any) {
        console.error('Error in setDefaultAddressController:', error);
        const statusCode = error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({ message: error.message || 'Server error setting default address.' });
    }
});


export const addAddressController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || typeof req.user === 'string' || !req.user.id) {
        res.status(401).json({ message: 'Authentication required.' }); return;
    }
    const userId = req.user.id;
    const { fullName, address, phoneNumber } = req.body;

    // Basic validation
    if (!fullName || !address || !phoneNumber) {
        res.status(400).json({ message: 'Full name, address, and phone number are required.' });
        return;
    }

    try {
        const newAddress = await addAddressForUser(userId, { fullName, address, phoneNumber });
        res.status(201).json({ // 201 Created status
            message: 'Address added successfully!',
            address: newAddress,
        });
    } catch (error: any) {
        console.error('Error in addAddressController:', error);
        res.status(500).json({ message: error.message || 'Server error adding address.' });
    }
});

export const updateAddressController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || typeof req.user === 'string' || !req.user.id) {
        res.status(401).json({ message: 'Authentication required.' }); return;
    }
    const userId = req.user.id;
    const addressId = req.params.id;
    const { fullName, address, phoneNumber } = req.body;

    if (!fullName && !address && !phoneNumber) {
        res.status(400).json({ message: 'At least one field (fullName, address, phoneNumber) must be provided for update.' });
        return;
    }

    try {
        const updatedAddress = await updateAddressForUser(userId, addressId, { fullName, address, phoneNumber });
        res.status(200).json({
            message: 'Address updated successfully!',
            address: updatedAddress,
        });
    } catch (error: any) {
        console.error('Error in updateAddressController:', error);
        const statusCode = error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({ message: error.message || 'Server error updating address.' });
    }
});