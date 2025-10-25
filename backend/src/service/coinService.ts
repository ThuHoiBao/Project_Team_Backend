import { Coin } from '../models/Coin';

export const getCoinBalanceForUser = async (userId: string): Promise<number> => {
    try {
        const coinBalanceDoc = await Coin.findOne({ User: userId });

        if (coinBalanceDoc) {
            return coinBalanceDoc.value;
        } else {
            console.warn(`Coin document not found for user ${userId}, assuming balance is 0.`);
            return 0;
        }
    } catch (error) {
        console.error(`Error fetching coin balance for user ${userId}:`, error);
        throw new Error('Database error while fetching coin balance.');
    }
};
