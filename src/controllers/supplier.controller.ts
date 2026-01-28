import type { Request, Response } from 'express';
import { createSupplierService, getSuppliersService } from '../services/supplier.service.js';

export const createSupplier = async (req: Request, res: Response) => {
  try {
    const newSupplier = await createSupplierService(req.body);

    return res.status(201).json({
      message: "Thêm nhà cung cấp thành công",
      data: newSupplier,
    });

  } catch (error: any) {
    console.error("Create Supplier Error:", error);

    if (error.message === "MISSING_NAME") {
      return res.status(400).json({ message: "Tên nhà cung cấp không được để trống" });
    }

    if (error.message === "DUPLICATE_CODE") {
      return res.status(400).json({ 
        message: `Mã nhà cung cấp '${req.body.manhacungcap}' đã tồn tại. Vui lòng chọn mã khác.` 
      });
    }

    if (error.message === "DUPLICATE_ENTRY") {
      return res.status(400).json({ 
        message: "Dữ liệu bị trùng lặp (Mã, Email hoặc MST đã tồn tại)" 
      });
    }

    return res.status(500).json({
      message: "Lỗi hệ thống: " + error.message,
    });
  }
};

export const getSuppliers = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;

    const { suppliers, total } = await getSuppliersService({ 
      page, 
      limit, 
      search, 
      status 
    });

    return res.status(200).json({
      message: "Lấy danh sách nhà cung cấp thành công",
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: suppliers,
    });

  } catch (error: any) {
    console.error("Get All Suppliers Error:", error);
    return res.status(500).json({
      message: "Lỗi hệ thống: " + error.message,
    });
  }
};
