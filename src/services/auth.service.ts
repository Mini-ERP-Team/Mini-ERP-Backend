import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';

const SECRET_KEY = process.env.JWT_SECRET || 'abcxyzefgh123';
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY || 'abcxyzefgh1234';

export const loginUser = async (mail: string, matkhau: string) => {
  const user = await prisma.nguoiDung.findUnique({
    where: { mail: mail },
  });

  if (!user) {
    throw new Error('Email không tồn tại trong hệ thống.');
  }

  const isMatch = await bcrypt.compare(matkhau, user.matkhau);

  if (!isMatch) {
    throw new Error('Mật khẩu không chính xác.');
  }

    await prisma.nguoiDung.update({
        where: { idnguoidung: user.idnguoidung },
        data: {
            lancuoidangnhap: new Date()
        }
    });

    console.log("Cap nhat thanh cong!")

  const accessToken = jwt.sign(
    { id: user.idnguoidung, role: user.vaitro },
    SECRET_KEY,
    { expiresIn: '15m' },
  );

  const refreshToken = jwt.sign(
    { id: user.idnguoidung },
    process.env.REFRESH_SECRET_KEY || 'abcxyzefgh1234',
    { expiresIn: '7d' },
  );

  const { matkhau: _, ...userInfo } = user;

  return {
    accessToken,
    refreshToken,
    user: userInfo,
  };
};

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET_KEY) as {
      id: number;
    };

    const user = await prisma.nguoiDung.findUnique({
      where: { idnguoidung: decoded.id },
    });

    if (!user) {
      throw new Error('User không tồn tại');
    }

    const newAccessToken = jwt.sign(
      {
        id: user.idnguoidung,
        role: user.vaitro,
      },
      SECRET_KEY,
      { expiresIn: '15m' },
    );

    const { matkhau: _, ...userInfo } = user;

    return { newAccessToken, user: userInfo };
  } catch (error) {
    throw new Error('Refresh token không hợp lệ hoặc đã hết hạn');
  }
};
