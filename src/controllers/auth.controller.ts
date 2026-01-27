import type { Request, Response } from 'express';
import * as authService from '../services/auth.service.js';

export const login = async (req: Request, res: Response) => {
  try {
    const { mail, matkhau } = req.body;

    const result = await authService.loginUser(mail, matkhau);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res
      .status(401)
      .json({ message: 'Bạn chưa đăng nhập (Không tìm thấy Cookie)' });
  }

  try {
    const result = await authService.refreshAccessToken(refreshToken);

    res.status(200).json({
      accessToken: result.newAccessToken,
      user: result.user,
    });
  } catch (err) {
    res.clearCookie('refreshToken');
    res
      .status(403)
      .json({ message: 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại' });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  // return res.status(200).json({ message: "Đăng xuất thành công" });
  return res.status(204).send();
};
