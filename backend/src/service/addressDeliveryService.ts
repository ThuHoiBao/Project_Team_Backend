import { AddressDelivery, IAddressDelivery } from '../models/AddressDelivery'; 
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
