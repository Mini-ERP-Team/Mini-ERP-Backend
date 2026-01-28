import type { Request, Response } from 'express';
import { createProductService } from '../services/product.service.js';
import type { CreateProductDto } from '../dtos/product.dto.js';
import { Prisma } from '../../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';

export const addProduct = async (req: Request, res: Response) => {
  try {
    const payload = req.body as CreateProductDto;

    const result = await createProductService(payload);

    return res.status(201).json({
      message: "Tạo sản phẩm và nhập kho thành công",
      data: result
    });

  } catch (error: any) {
    console.error("Add Product Error:", error);

    const statusCode = error.message === "Tên sản phẩm là bắt buộc" || error.message.includes("ít nhất một phân loại") 
      ? 400 
      : 500;

    return res.status(statusCode).json({
      message: error.message || "Lỗi hệ thống",
    });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const sort = req.query.sort as string;

    const whereCondition: Prisma.SanPhamWhereInput = {
      ...(search && {
        tensanpham: {
          contains: search,
          mode: 'insensitive', 
        },
      }),
      ...(category && {
        danhmuc: category,
      }),
    };

    let orderBy: Prisma.SanPhamOrderByWithRelationInput = { idsanpham: 'desc' };
    
    if (sort === 'oldest') orderBy = { idsanpham: 'asc' };

    const [products, total] = await prisma.$transaction([
      prisma.sanPham.findMany({
        where: whereCondition,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: orderBy,
        include: {
          phanLoais: {
            select: {
              idphanloai: true,
              tenphanloai: true,
              giaban: true,
              gianhap: true,
              tonkho: true,
              hinhanh: true,
              sku: true,
              mausac: true,
              dungluong: true
            }
          }
        },
      }),
      prisma.sanPham.count({ where: whereCondition }),
    ]);

    const formattedProducts = products.map((product) => {
      const variants = product.phanLoais;

      const prices = variants.map((v) => v.giaban);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

      const totalStock = variants.reduce((sum, v) => sum + v.tonkho, 0);

      const displayImage = product.hinhanh || (variants.length > 0 ? variants[0]?.hinhanh : null);

      return {
        id: product.idsanpham,
        name: product.tensanpham,
        category: product.danhmuc,
        brand: product.thuonghieu,
        model: product.model,
        image: displayImage,
        
        price: {
          min: minPrice,
          max: maxPrice,
          display: minPrice === maxPrice 
            ? `${minPrice}` 
            : `${minPrice} - ${maxPrice}`
        },
        stock: totalStock,
        variantCount: variants.length,
        
        variants: variants 
      };
    });

    return res.status(200).json({
      message: "Lấy danh sách sản phẩm thành công",
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: formattedProducts,
    });

  } catch (error: any) {
    console.error("Get All Products Error:", error);
    return res.status(500).json({
      message: "Lỗi hệ thống: " + error.message,
    });
  }
};
