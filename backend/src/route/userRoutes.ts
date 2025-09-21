import express from 'express';
import {getUsernameById} from '../controller/userController'
const router = express.Router();

router.get("/product/feedback/user/:id",getUsernameById )



export default router