import { Router } from 'express';
import { addUser, getUsers, updateStatus, updateUser } from '../controllers/user.controller.js';

const router = Router();

router.post("/users", addUser);
router.get("/users", getUsers);
router.put("/users/:id", updateStatus);
router.put("/users/:id", updateUser);
export default router;
