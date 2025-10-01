import { getTopFeedbackNewest } from "../service/feedbackService";
import { Request, Response } from "express";

export const getTopFeedbackNewestController = async (req: Request, res: Response) => {
  try {
    const response = await getTopFeedbackNewest();
    if (!response.success) {
      return res.status(404).json(response);
    }
    return res.status(200).json(response);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
