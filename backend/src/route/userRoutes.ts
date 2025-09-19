import express from 'express';
import {getUsernameById} from '../controller/userController'
const router = express.Router();

router.get("/user/:id",getUsernameById )



export default router