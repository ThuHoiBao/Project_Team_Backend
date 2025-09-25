import {getImageFeedback} from '../controller/imageFeedbackController'
import express from 'express';
const router = express.Router();

router.get("/feedback/image/:id", getImageFeedback)

export default router;
