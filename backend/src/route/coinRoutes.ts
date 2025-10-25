import { getCoin } from "../controller/coinController";
import authenticateToken from "../middleware/authenticateToken";
import express from 'express';

const router = express.Router();

router.get('/coin',authenticateToken, getCoin )


export default router
