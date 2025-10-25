import { Coin } from "../models/Coin";


export const getCoinService = async (userId: string) => {
    const coin = await Coin.find({ User: userId })
    if (!coin)
        return {
            success: false,
            message: "Không tìm thấy dữ liệu",
        };
    else
        return {
            success: true,
            data: coin
        }

}