import { Router } from 'express';
import { createSupplier, getSuppliers } from '../controllers/supplier.controller.js';

const router = Router();

router.post("/suppliers", createSupplier);
router.get("/suppliers", getSuppliers);

export default router;
