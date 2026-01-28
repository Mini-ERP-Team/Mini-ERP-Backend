import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { Prisma } from '../../generated/prisma/client.js';

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = req.query.search as string;

    const whereCondition: Prisma.KhachHangWhereInput = search
      ? {
          OR: [
            { tenkhachhang: { contains: search, mode: 'insensitive' } },
            { sdt: { contains: search } },
          ],
        }
      : {};

    const [customers, total] = await prisma.$transaction([
      prisma.khachHang.findMany({
        where: whereCondition,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { idkhachhang: 'desc' },
      }),
      prisma.khachHang.count({ where: whereCondition }),
    ]);

    return res.status(200).json({
      message: "Lấy danh sách khách hàng thành công",
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: customers,
    });

  } catch (error: any) {
    console.error("Get Customers Error:", error);
    return res.status(500).json({
      message: "Lỗi hệ thống: " + error.message,
    });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { tenkhachhang, sdt } = req.body;

    if (!tenkhachhang || tenkhachhang.trim() === "") {
      return res.status(400).json({ message: "Tên khách hàng không được để trống." });
    }

    const finalSdt = sdt && sdt.trim() !== "" ? sdt.trim() : null;

    const newCustomer = await prisma.khachHang.create({
      data: {
        tenkhachhang: tenkhachhang.trim(),
        sdt: finalSdt,
      },
    });

    return res.status(201).json({
      message: "Tạo khách hàng thành công",
      data: newCustomer,
    });

  } catch (error: any) {
    console.error("Create Customer Error:", error);

    if (error.code === 'P2002' && error.meta?.target?.includes('sdt')) {
      return res.status(409).json({
        message: "Số điện thoại này đã tồn tại trong hệ thống.",
      });
    }

    return res.status(500).json({
      message: "Lỗi hệ thống: " + error.message,
    });
  }
};
