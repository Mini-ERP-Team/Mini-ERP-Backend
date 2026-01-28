import type { Prisma } from '../../generated/prisma/client.js';
import type { CreateSupplierDto, GetSuppliersInput } from '../dtos/supplier.dto.js';
import { prisma } from '../lib/prisma.js';

export const createSupplierService = async (data: CreateSupplierDto) => {
  const { manhacungcap, tennhacungcap } = data;

  if (!tennhacungcap) {
    throw new Error("MISSING_NAME");
  }

  if (manhacungcap) {
    const existingSupplier = await prisma.nhaCungCap.findUnique({
      where: { manhacungcap: manhacungcap }
    });

    if (existingSupplier) {
      throw new Error("DUPLICATE_CODE");
    }
  }

  try {
    const newSupplier = await prisma.nhaCungCap.create({
      data: {
        ...data,
        trangthai: data.trangthai !== undefined ? data.trangthai : true, 
      },
    });
    return newSupplier;
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new Error("DUPLICATE_ENTRY");
    }
    throw error;
  }
};

export const getSuppliersService = async ({ 
  page = 1, 
  limit = 10, 
  search, 
  status 
}: GetSuppliersInput) => {
  
  const whereCondition: Prisma.NhaCungCapWhereInput = {
    AND: [
      search ? {
        OR: [
          { tennhacungcap: { contains: search, mode: 'insensitive' } },
          { manhacungcap: { contains: search, mode: 'insensitive' } },
          { sdt: { contains: search } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      } : {},
      
      status === 'active' ? { trangthai: true } :
      status === 'inactive' ? { trangthai: false } : {}
    ]
  };

  const [suppliers, total] = await prisma.$transaction([
    prisma.nhaCungCap.findMany({
      where: whereCondition,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { idnhacungcap: 'desc' },
    }),
    prisma.nhaCungCap.count({ where: whereCondition }),
  ]);

  return { suppliers, total };
};
