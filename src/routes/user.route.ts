import { Router } from 'express';
import { addUser, getUsers } from '../controllers/user.controller.js';

const router = Router();

router.post("/users", addUser);
router.get("/users", getUsers);

export default router;
