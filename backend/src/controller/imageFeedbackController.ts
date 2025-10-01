import { log } from 'console';
import { getImageFeedbackService } from '../service/imageFeedbackService'
import { Request, Response } from "express";

export const getImageFeedback = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const response = await getImageFeedbackService(id);
        
        if (!response.success) {
            return res.status(404).json(response);
        }
        

        return res.status(200).json(response);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};