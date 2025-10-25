import express from 'express';
import { getDefaultAddressController,
    getAllAddressesController,
    setDefaultAddressController, addAddressController,
    updateAddressController } from '../controller/addressDeliveryController'; 
import { authenticateToken } from '../middleware/authenticateToken'; 

const router = express.Router();

router.get('/default', authenticateToken, getDefaultAddressController);

router.get('/', authenticateToken, getAllAddressesController);

router.patch('/:id/default', authenticateToken, setDefaultAddressController);

router.post('/', authenticateToken, addAddressController);       
router.put('/:id', authenticateToken, updateAddressController); 

export default router;