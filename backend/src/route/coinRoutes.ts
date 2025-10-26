import express from 'express';
import { getCoinBalanceController, getCoin } from '../controller/coinController'; 
import { authenticateToken } from '../middleware/authenticateToken'; 

const router = express.Router();

router.get('/balance', authenticateToken, getCoinBalanceController);
router.get('/coin',authenticateToken, getCoin )

export default router
