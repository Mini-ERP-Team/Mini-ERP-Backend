import { Router } from 'express';
import { login, logout, refreshToken } from '../controllers/auth.controller.js';

const router = Router();

router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post("/logout", logout);

export default router;
