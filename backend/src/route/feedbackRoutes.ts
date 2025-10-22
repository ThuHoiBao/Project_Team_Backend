// feedbackRoute
import express from 'express';
import { bulkFeedback, upload ,getFeedbacksByOrder, getTopFeedbackNewestController} from "../controller/feedbackController.ts";

const router = express.Router();

// frontend gọi POST http://localhost:8088/api/feedback/bulk
// `upload.any()` để nhận tất cả files
router.post("/bulk", upload.any(), bulkFeedback);
router.get("/order/:orderId", getFeedbacksByOrder);
router.get("/feedback/best", getTopFeedbackNewestController);

export default router;
