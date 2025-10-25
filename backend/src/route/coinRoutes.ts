import express from 'express';
import { getCoinBalanceController } from '../controller/coinController'; 
import { authenticateToken } from '../middleware/authenticateToken'; 

const router = express.Router();

router.get('/balance', authenticateToken, getCoinBalanceController);

export default router;