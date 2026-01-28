import type { Request, Response } from 'express';
import { confirmImportService, createImportService, getImportDetailService, getImportsService } from '../services/import.service.js';
import type { CreateImportDto } from '../dtos/import.dto.js';
import type { Prisma } from '../../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';

export const createImport = async (req: Request, res: Response) => {
  try {
    const dto = req.body as CreateImportDto;

    const newImport = await createImportService(dto);

    return res.status(201).json({
      message: "Tạo phiếu nhập thành công",
      data: newImport
    });

  } catch (error: any) {
    console.error("Create Import Error:", error);
    
    if (error.message === "MISSING_SUPPLIER") {
      return res.status(400).json({ message: "Chưa chọn nhà cung cấp." });
    }

    if (error.message === "EMPTY_ITEMS") {
      return res.status(400).json({ message: "Danh sách sản phẩm nhập không được để trống." });
    }

    if (error.message === "DUPLICATE_CODE") {
      return res.status(400).json({ message: "Mã phiếu nhập đã tồn tại." });
    }

    if (error.message === "INVALID_REFERENCE") {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ (Nhà cung cấp hoặc Sản phẩm không tồn tại)." });
    }

    return res.status(500).json({
      message: "lỗi hệ thống: " + error.message,
    });
  }
};

export const getImports = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;

    const { imports, total } = await getImportsService({ 
      page, 
      limit, 
      search, 
      status 
    });

    const formattedImports = imports.map(item => {
      const totalItems = item.chiTiet.reduce((sum, detail) => sum + detail.soluong, 0);

      return {
        id: item.idphieunhap,
        importId: item.maphieu,
        supplier: {
          name: item.nhaCungCap.tennhacungcap,
          address: item.nhaCungCap.diachi || 'Domestic',
          code: item.nhaCungCap.manhacungcap
        },
        dateReceived: item.ngaytao,
        totalItems: totalItems,
        totalAmount: item.tongtien,
        status: item.trangthai,
        note: item.ghiChu
      };
    });

    return res.status(200).json({
      message: "Lấy danh sách phiếu nhập thành công",
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      data: formattedImports
    });

  } catch (error: any) {
    console.error("Get All Imports Error:", error);
    return res.status(500).json({
      message: "Lỗi hệ thống: " + error.message
    });
  }
};

export const confirmImport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await confirmImportService(Number(id));

    return res.status(200).json({ 
      message: "Duyệt phiếu và nhập kho thành công!" 
    });

  } catch (error: any) {
    console.error("Confirm Import Error:", error);

    if (error.message === "NOT_FOUND") {
      return res.status(404).json({ message: "Không tìm thấy phiếu nhập." });
    }

    if (error.message === "INVALID_STATUS") {
      return res.status(400).json({ message: "Phiếu này đã được xử lý trước đó rồi (Không phải trạng thái Pending)." });
    }

    return res.status(500).json({ 
      message: "Lỗi hệ thống: " + error.message 
    });
  }
};

export const getImportDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const rawData = await getImportDetailService(Number(id));

    const formattedData = {
      id: rawData.idphieunhap,
      code: rawData.maphieu,
      status: rawData.trangthai,
      createdAt: rawData.ngaytao,
      importedAt: rawData.ngayNhapKho,
      note: rawData.ghiChu,
      totalAmount: rawData.tongtien,
      
      supplier: {
        id: rawData.nhaCungCap.idnhacungcap,
        name: rawData.nhaCungCap.tennhacungcap,
        code: rawData.nhaCungCap.manhacungcap,
        phone: rawData.nhaCungCap.sdt,
        email: rawData.nhaCungCap.email,
        address: rawData.nhaCungCap.diachi,
      },

      createdBy: {
        name: rawData.nguoiLap?.hoten || "N/A",
        code: rawData.nguoiLap?.manhanvien || "N/A"
      },

      items: rawData.chiTiet.map(item => {
        const variant = item.phanLoai;
        const product = variant.sanPham;

        const fullName = [
          product.tensanpham,
          variant.mausac,
          variant.dungluong
        ].filter(Boolean).join(" - ");

        const image = variant.hinhanh || product.hinhanh;

        return {
          id: variant.idphanloai,
          sku: variant.sku,
          productName: product.tensanpham,
          variantName: fullName,
          category: product.danhmuc,
          brand: product.thuonghieu,
          image: image,
          
          quantity: item.soluong,
          importPrice: item.gianhap,
          total: item.thanhtien
        };
      })
    };

    return res.status(200).json({
      message: "Lấy chi tiết phiếu nhập thành công",
      data: formattedData
    });

  } catch (error: any) {
    console.error("Get Import Detail Error:", error);

    if (error.message === "NOT_FOUND") {
      return res.status(404).json({ message: "Không tìm thấy phiếu nhập." });
    }

    return res.status(500).json({
      message: "Lỗi hệ thống: " + error.message,
    });
  }
};
