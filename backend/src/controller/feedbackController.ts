
import { Request, Response } from "express";
import multer from "multer";
import { FeedbackService } from "../service/feedbackService.ts";
import { getTopFeedbackNewest } from "../service/feedbackService";
const storage = multer.memoryStorage();
export const upload = multer({ storage });

const feedbackService = new FeedbackService();

export const bulkFeedback = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const files = req.files as Express.Multer.File[];
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);

    const feedbacks: any[] = [];
    Object.keys(body).forEach((key) => {
      const match = key.match(/feedbacks\[(\d+)\]\.(.+)/);
      if (match) {
        const index = parseInt(match[1], 10);
        const field = match[2];
        if (!feedbacks[index]) {
          feedbacks[index] = { comment: "", rating: 0, orderItemId: "", images: [], userId: "", orderId:"" };
        }
        if (field === "rating") {
          feedbacks[index][field] = parseInt(body[key], 10);
        } else {
          feedbacks[index][field] = body[key];
        }
      }
    });
    console.log(feedbacks)
    await feedbackService.handleBulkFeedback(feedbacks, files);
    return res.json({ message: "Feedback thành công " });
  } catch (err: any) {
    console.error(" Lỗi bulkFeedback:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

export const getFeedbacksByOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const result = await feedbackService.getFeedbacksByOrder(orderId);

    return res.json(result.map((dto) => dto.toPlain()));
  } catch (err: any) {
    console.error("Lỗi getFeedbacksByOrder:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
}

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
