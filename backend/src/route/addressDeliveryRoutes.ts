import express from 'express';
import { getDefaultAddressController } from '../controller/addressDeliveryController'; 
import { authenticateToken } from '../middleware/authenticateToken'; 

const router = express.Router();

router.get('/default', authenticateToken, getDefaultAddressController);
export default router;