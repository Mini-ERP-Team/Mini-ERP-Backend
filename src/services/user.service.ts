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
export const updateStatus = async (id: string, data: Partial<{ hoten: string; mail: string; trangthai: boolean }>) => {
  return await prisma.nguoiDung.update({
    where: { idnguoidung: Number(id) },
    data,
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

export type UpdateUserInput = Partial<{
  hoten: string;
  mail: string;
  vaitro: string;
  sdt: string | null;
  anhdaidien: string | null;
  trangthai: boolean;
}>;

export const updateUser = async (id: string, data: UpdateUserInput) => {
  const updateData: any = {};

  if (data.hoten !== undefined) updateData.hoten = String(data.hoten);
  if (data.mail !== undefined) updateData.mail = String(data.mail);
  if (data.vaitro !== undefined) updateData.vaitro = String(data.vaitro);
  if (data.trangthai !== undefined) updateData.trangthai = Boolean(data.trangthai);

  // FE cách 1: thường gửi undefined khi rỗng => sẽ không update
  // Nếu có gửi string rỗng thì set null
  if (data.sdt !== undefined) updateData.sdt = data.sdt ? String(data.sdt) : null;
  if (data.anhdaidien !== undefined) updateData.anhdaidien = data.anhdaidien ? String(data.anhdaidien) : null;

  return await prisma.nguoiDung.update({
    where: { idnguoidung: Number(id) },
    data: updateData,
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
