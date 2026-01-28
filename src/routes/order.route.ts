import { Router } from 'express';
import { createOrder, getAllOrders, getOrderDetail } from '../controllers/order.controller.js';

const router = Router();

router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderDetail);
router.post('/orders', createOrder);

export default router;
