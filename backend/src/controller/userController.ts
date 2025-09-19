import { Request, Response } from "express";
import { getUsernameByIdService } from '../service/userService'

export const getUsernameById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const response = await getUsernameByIdService(id);

        if (!response.success) {
            return res.status(404).json(response);
        }

        return res.status(200).json(response);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }

}