import { PrismaClient } from '../../generated/prisma/client.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';

const SECRET_KEY = process.env.JWT_SECRET || 'secret-cua-ban';

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

  const token = jwt.sign(
    {
      id: user.idnguoidung,
      role: user.vaitro,
    },
    SECRET_KEY,
    { expiresIn: '1d' },
  );

  const { matkhau: _, ...userInfo } = user;

  return {
    accessToken: token,
    user: userInfo,
  };
};
