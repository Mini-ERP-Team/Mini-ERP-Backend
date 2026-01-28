import { Router } from 'express';
import authRoutes from './auth.route.js'; 
import userRoutes from './user.route.js'
import productRoutes from './product.route.js'
import supplierRoutes from './supplier.route.js'
import importRoutes from './import.route.js'
import customerRoutes from './customer.route.js'
import orderRoutes from './order.route.js'

const router = Router();

router.use('/auth', authRoutes); 
router.use('/', userRoutes);
router.use('/', productRoutes);
router.use('/', supplierRoutes);
router.use('/', importRoutes);
router.use('/', customerRoutes);
router.use('/', orderRoutes);

export default router;
