import { prisma } from '../lib/prisma.js';
import type { CreateImportDto, GetImportsInput } from '../dtos/import.dto.js';
import type { Prisma } from '../../generated/prisma/client.js';

export const createImportService = async (data: CreateImportDto) => {
  const { idnguoidung, idnhacungcap, ghiChu, maphieu, chiTiet } = data;

  if (!idnhacungcap) {
    throw new Error("MISSING_SUPPLIER");
  }
  
  if (!chiTiet || chiTiet.length === 0) {
    throw new Error("EMPTY_ITEMS");
  }

  const finalMaPhieu = maphieu ? maphieu : `PN-${Date.now()}`;

  let calculatedTotal = 0;

  const importDetailsData = chiTiet.map((item) => {
    const thanhtien = item.soluong * item.gianhap;
    calculatedTotal += thanhtien;

    return {
      idphanloai: item.idphanloai,
      soluong: item.soluong,
      gianhap: item.gianhap,
      thanhtien: thanhtien
    };
  });

  try {
    const newImport = await prisma.phieuNhap.create({
      data: {
        maphieu: finalMaPhieu,
        trangthai: "PENDING",
        ngaytao: new Date(),
        ngayNhapKho: null,
        ghiChu: ghiChu,
        tongtien: calculatedTotal,
        
        idnguoidung,
        idnhacungcap: idnhacungcap,
        
        chiTiet: {
          create: importDetailsData
        }
      },
      include: {
        chiTiet: {
          include: {
            phanLoai: { select: { tenphanloai: true, sku: true } }
          }
        },
        nhaCungCap: { select: { tennhacungcap: true } }
      }
    });

    return newImport;

  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('maphieu')) {
      throw new Error("DUPLICATE_CODE");
    }
    
    if (error.code === 'P2003') {
       throw new Error("INVALID_REFERENCE");
    }

    throw error;
  }
};

export const getImportsService = async ({ 
  page = 1, 
  limit = 10, 
  search, 
  status 
}: GetImportsInput) => {

  const whereCondition: Prisma.PhieuNhapWhereInput = {
    AND: [
      search ? {
        OR: [
          { maphieu: { contains: search, mode: 'insensitive' } },
          { nhaCungCap: { tennhacungcap: { contains: search, mode: 'insensitive' } } }
        ]
      } : {},
      
      status ? { trangthai: status as any } : {}
    ]
  };

  const [imports, total] = await prisma.$transaction([
    prisma.phieuNhap.findMany({
      where: whereCondition,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { ngaytao: 'desc' },
      include: {
        nhaCungCap: {
          select: {
            tennhacungcap: true,
            diachi: true,
            manhacungcap: true
          }
        },
        chiTiet: {
          select: { soluong: true }
        }
      }
    }),
    prisma.phieuNhap.count({ where: whereCondition })
  ]);

  return { imports, total };
};

export const confirmImportService = async (id: number) => {
  const currentImport = await prisma.phieuNhap.findUnique({
    where: { idphieunhap: id },
    include: { chiTiet: true }
  });

  if (!currentImport) {
    throw new Error("NOT_FOUND");
  }

  if (currentImport.trangthai !== "PENDING") {
    throw new Error("INVALID_STATUS");
  }

  await prisma.$transaction(async (tx) => {
    
    await tx.phieuNhap.update({
      where: { idphieunhap: id },
      data: {
        trangthai: "COMPLETED",
        ngayNhapKho: new Date(),
      }
    });

    for (const item of currentImport.chiTiet) {
      await tx.phanLoaiSanPham.update({
        where: { idphanloai: item.idphanloai },
        data: {
          tonkho: { increment: item.soluong }, 
          
          gianhap: item.gianhap 
        }
      });
    }
  });

  return true;
};

export const getImportDetailService = async (id: number) => {
  const importData = await prisma.phieuNhap.findUnique({
    where: { idphieunhap: id },
    include: {
      nhaCungCap: true, 
      
      nguoiLap: {
        select: {
          hoten: true,
          manhanvien: true,
          mail: true 
        }
      },

      chiTiet: {
        include: {
          phanLoai: {
            include: {
              sanPham: {
                select: {
                  tensanpham: true,
                  hinhanh: true,
                  danhmuc: true,
                  thuonghieu: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!importData) {
    throw new Error("NOT_FOUND");
  }

  return importData;
};
