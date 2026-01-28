import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import type { Prisma } from '../../generated/prisma/client.js';

interface OrderLineCreate {
  idphanloai: number;
  soluong: number;
  giaban: number;
}

interface CreateOrderBody {
    idnguoidung: number;
  idkhachhang: number;
  phuongthucTT: string;
  tongtien: number;
  chiTiet: OrderLineCreate[];
}

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { idnguoidung, idkhachhang, phuongthucTT, chiTiet } = req.body as CreateOrderBody;

    if (!idkhachhang) return res.status(400).json({ message: "Thiếu thông tin khách hàng." });
    if (!chiTiet || chiTiet.length === 0) return res.status(400).json({ message: "Giỏ hàng trống." });

    const result = await prisma.$transaction(async (tx) => {
      let serverCalculatedTotal = 0;

      for (const item of chiTiet) {
        const productVariant = await tx.phanLoaiSanPham.findUnique({
          where: { idphanloai: item.idphanloai },
          select: { tonkho: true, sku: true, sanPham: { select: { tensanpham: true } } }
        });

        if (!productVariant) {
          throw new Error(`Sản phẩm ID ${item.idphanloai} không tồn tại.`);
        }

        if (productVariant.tonkho < item.soluong) {
          throw new Error(`Sản phẩm "${productVariant.sanPham?.tensanpham} - ${productVariant.sku}" không đủ hàng. Tồn: ${productVariant.tonkho}, Mua: ${item.soluong}`);
        }

        serverCalculatedTotal += item.soluong * item.giaban;
      }

      const newOrder = await tx.donBan.create({
        data: {
        idnguoidung,
          idkhachhang,
          phuongthucTT: phuongthucTT,
          tongtien: serverCalculatedTotal,
          trangthai: "COMPLETED",
          ngaytao: new Date(),
          
          chiTiet: {
            create: chiTiet.map(item => ({
              idphanloai: item.idphanloai,
              soluong: item.soluong,
              giaban: item.giaban,
              thanhtien: item.soluong * item.giaban
            }))
          }
        }
      });

      for (const item of chiTiet) {
        await tx.phanLoaiSanPham.update({
          where: { idphanloai: item.idphanloai },
          data: {
            tonkho: { decrement: item.soluong }
          }
        });
      }

      if (idkhachhang !== 1) {
         const points = Math.floor(serverCalculatedTotal / 100000);
         if (points > 0) {
           await tx.khachHang.update({
             where: { idkhachhang },
             data: { diemtichluy: { increment: points } }
           });
         }
      }

      return newOrder;
    });

    return res.status(201).json({
      message: "Tạo đơn hàng thành công!",
      data: result
    });

  } catch (error: any) {
    console.error("Create Order Error:", error);
    
    return res.status(400).json({
      message: error.message || "Lỗi khi tạo đơn hàng."
    });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string;
    
    const whereCondition: Prisma.DonBanWhereInput = {};
    
    if (search) {
      if (!isNaN(Number(search))) {
        whereCondition.iddonban = Number(search);
      } else {
        whereCondition.khachHang = {
          OR: [
            { tenkhachhang: { contains: search, mode: 'insensitive' } },
            { sdt: { contains: search } }
          ]
        };
      }
    }

    const [orders, total] = await prisma.$transaction([
      prisma.donBan.findMany({
        where: whereCondition,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { ngaytao: 'desc' },
        include: {
          khachHang: { select: { tenkhachhang: true, sdt: true } },
          _count: { select: { chiTiet: true } }
        }
      }),
      prisma.donBan.count({ where: whereCondition })
    ]);

    const formattedData = orders.map(order => ({
      iddonban: order.iddonban,
      khachHang: {
        tenkhachhang: order.khachHang.tenkhachhang,
        idkhachhang: order.idkhachhang,
        sdt: order.khachHang.sdt || "Khách lẻ",
      },
      tongtien: order.tongtien,
      phuongthucTT: order.phuongthucTT,
      trangthai: order.trangthai,
      chiTiet: order._count.chiTiet,
      ngaytao: order.ngaytao
    }));

    return res.status(200).json({
      message: "Lấy danh sách đơn hàng thành công",
      data: formattedData,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    console.error("Get All Orders Error:", error);
    return res.status(500).json({ message: "Lỗi hệ thống: " + error.message });
  }
};

export const getOrderDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.donBan.findUnique({
      where: { iddonban: Number(id) },
      include: {
        khachHang: true,
        
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

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    const formattedDetail = {
      iddonban: order.iddonban,
      ngaytao: order.ngaytao,
      trangthai: order.trangthai,
      phuongthucTT: order.phuongthucTT,
      tongtien: order.tongtien,
      
      khachHang: order.khachHang ? {
        idkhachhang: order.khachHang.idkhachhang,
        tenkhachhang: order.khachHang.tenkhachhang,
        sdt: order.khachHang.sdt,
        diemtichluy: order.khachHang.diemtichluy
      } : null,

      chiTiet: order.chiTiet.map(item => {
        const variant = item.phanLoai;
        const product = variant.sanPham;
        
        const variantName = [
          product.tensanpham, 
          variant.mausac, 
          variant.dungluong
        ].filter(Boolean).join(" - ");

        return {
          idphanloai: item.idphanloai,
          soluong: item.soluong,
          giaban: item.giaban,
          thanhtien: item.thanhtien,
          phanLoai: {
            idphanloai: item.idphanloai,
            sku: variant.sku,
            tenphanloai: variant.tenphanloai,
            sanPham: {
                idsanpham: item.phanLoai.idphanloai,
                tensanpham: product.tensanpham,
                danhmuc: product.danhmuc,
                thuonghieu: product.thuonghieu
            }       
          }
        };
      })
    };

    return res.status(200).json({
      message: "Lấy chi tiết đơn hàng thành công",
      data: formattedDetail
    });

  } catch (error: any) {
    console.error("Get Order Detail Error:", error);
    return res.status(500).json({ message: "Lỗi hệ thống: " + error.message });
  }
};
