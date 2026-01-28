import type { CreateProductDto } from '../dtos/product.dto.js';
import { prisma } from '../lib/prisma.js';

export const createProductService = async (data: CreateProductDto) => {
  const { sanPham, phanLoais, userId } = data;

  if (!sanPham?.tensanpham) {
    throw new Error("Tên sản phẩm là bắt buộc");
  }
  if (!phanLoais || phanLoais.length === 0) {
    throw new Error("Sản phẩm phải có ít nhất một phân loại");
  }

  const result = await prisma.$transaction(async (tx) => {
    const newProduct = await tx.sanPham.create({
      data: {
        ...sanPham,
        idnguoidung: userId, 
        
        phanLoais: {
          create: phanLoais.map((v) => ({
            tenphanloai: v.tenphanloai,
            sku: v.sku,
            mausac: v.mausac,
            dungluong: v.dungluong,
            xuatxu: v.xuatxu,
            loaiChiTiet: v.loaiChiTiet,
            nhaSanXuat: v.nhaSanXuat,
            tuongThich: v.tuongThich,
            thongSoKyThuat: v.thongSoKyThuat,
            gianhap: v.gianhap,
            giaban: v.giaban,
            tonkho: v.tonkho,
            hinhanh: sanPham.hinhanh
          }))
        }
      },
      include: { phanLoais: true }
    });

    return newProduct;
  });

  return result;
};
