import { AddressDelivery, IAddressDelivery } from '../models/AddressDelivery'; 
import mongoose from 'mongoose';

export const getDefaultAddressForUser = async (userId: string): Promise<IAddressDelivery | null> => {
    try {
        let defaultAddress = await AddressDelivery.findOne({ user: userId, isDefault: true });

        if (!defaultAddress) {
            console.warn(`No default address found for user ${userId}. Fetching the latest updated address as fallback.`);
            defaultAddress = await AddressDelivery.findOne({ user: userId }).sort({ updatedAt: -1 });
        }

        return defaultAddress;

    } catch (error) {
        console.error(`Error fetching default address for user ${userId}:`, error);
        throw new Error('Database error while fetching default address.');
    }
};

export const getAllAddressesForUser = async (userId: string): Promise<IAddressDelivery[]> => {
    try {
        const addresses = await AddressDelivery.find({ user: userId })
            .sort({ isDefault: -1, updatedAt: -1 });
        return addresses;
    } catch (error) {
        console.error(`Error fetching all addresses for user ${userId}:`, error);
        throw new Error('Database error while fetching addresses.');
    }
};


export const setDefaultAddressForUser = async (userId: string, addressId: string): Promise<IAddressDelivery> => {
    try {
        await AddressDelivery.updateMany(
            { user: userId, _id: { $ne: addressId } },
            { $set: { isDefault: false } }
        );

        const updatedAddress = await AddressDelivery.findOneAndUpdate(
            { _id: addressId, user: userId },
            { $set: { isDefault: true } },
            { new: true } 
        );

        if (!updatedAddress) {
            throw new Error(`Address with ID ${addressId} not found or does not belong to user ${userId}.`);
        }


        return updatedAddress;

    } catch (error) {
        console.error(`Error setting default address ${addressId} for user ${userId}:`, error);
        if (error instanceof Error && error.message.includes('not found')) {
             throw error; 
        }
        throw new Error('Database error while setting default address.');
    }
};

export const addAddressForUser = async (userId: string, addressData: { fullName: string; address: string; phoneNumber: string }): Promise<IAddressDelivery> => {
    try {
        const existingAddressesCount = await AddressDelivery.countDocuments({ user: userId });

        const newAddress = new AddressDelivery({
            user: userId,
            fullName: addressData.fullName,
            address: addressData.address,
            phoneNumber: addressData.phoneNumber,
            isDefault: existingAddressesCount === 0, 
        });

        const savedAddress = await newAddress.save();
        return savedAddress;
    } catch (error) {
        console.error(`Error adding address for user ${userId}:`, error);
        throw new Error('Database error while adding address.');
    }
};

export const updateAddressForUser = async (userId: string, addressId: string, updateData: { fullName?: string; address?: string; phoneNumber?: string }): Promise<IAddressDelivery> => {
    try {
        const address = await AddressDelivery.findOne({ _id: addressId, user: userId });

        if (!address) {
            throw new Error(`Address with ID ${addressId} not found or does not belong to user ${userId}.`);
        }

        if (updateData.fullName) address.fullName = updateData.fullName;
        if (updateData.address) address.address = updateData.address;
        if (updateData.phoneNumber) address.phoneNumber = updateData.phoneNumber;

        const updatedAddress = await address.save();
        return updatedAddress;
    } catch (error) {
        console.error(`Error updating address ${addressId} for user ${userId}:`, error);
         if (error instanceof Error && error.message.includes('not found')) {
             throw error; 
        }
        throw new Error('Database error while updating address.');
    }
};