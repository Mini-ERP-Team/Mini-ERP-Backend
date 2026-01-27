import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';

export const createNewUser = async (data: any) => {
  const { hoten, mail, matkhau, vaitro, sdt, manhanvien, anhdaidien, trangthai } = data;

  let finalStaffId = manhanvien;
  if (!finalStaffId) {
    const count = await prisma.nguoiDung.count();
    finalStaffId = `NV-${(count + 1).toString().padStart(3, '0')}`;
  }

  const hashed = await bcrypt.hash(String(matkhau), 10);

  return await prisma.nguoiDung.create({
    data: {
      hoten: String(hoten),
      mail: String(mail),
      matkhau: hashed,
      vaitro: String(vaitro),
      sdt: sdt ? String(sdt) : null,
      manhanvien: String(finalStaffId),
      anhdaidien: anhdaidien ? String(anhdaidien) : null,
      trangthai: typeof trangthai === "boolean" ? trangthai : true,
    },
    select: {
      idnguoidung: true,
      manhanvien: true,
      hoten: true,
      mail: true,
      vaitro: true,
      trangthai: true,
    sdt: true,
            lancuoidangnhap: true,
    },
  });
};


export const getAllUsers = async () => {
  return await prisma.nguoiDung.findMany({
    orderBy: {
      ngaytaotk: 'desc',
    },
    select: {
      idnguoidung: true,
      manhanvien: true,
      hoten: true,
      mail: true,
      vaitro: true,
      sdt: true,
      trangthai: true,
      lancuoidangnhap: true,
      anhdaidien: true,
    },
  });
};
