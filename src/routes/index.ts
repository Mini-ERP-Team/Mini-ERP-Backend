import { Router } from 'express';
import authRoutes from './auth.route.js'; 
import userRoutes from './user.route.js'
import productRoutes from './product.route.js'

const router = Router();

router.use('/auth', authRoutes); 
router.use('/', userRoutes);
router.use('/', productRoutes);

export default router;
