import { getCoinService } from "../service/coinService";
import { Request, Response } from "express";


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