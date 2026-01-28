import { Router } from 'express';
import { createCustomer, getCustomers } from '../controllers/customer.controller.js';

const router = Router();

router.get('/customers', getCustomers);
router.post('/customers', createCustomer);

export default router;
