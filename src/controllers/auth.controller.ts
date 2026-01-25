import type { Request, Response } from 'express';
import * as authService from '../services/auth.service.js';

export const login = async (req: Request, res: Response) => {
  try {
    const { mail, matkhau } = req.body;
    
    const result = await authService.loginUser(mail, matkhau);
    
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};