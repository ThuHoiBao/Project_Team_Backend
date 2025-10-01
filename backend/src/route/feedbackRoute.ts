import { getTopFeedbackNewestController } from '../controller/feedbackController';
import express from 'express';

const router = express.Router();

// Lấy những feedback tốt nhất
router.get("/feedback/best", getTopFeedbackNewestController);

export default router;
