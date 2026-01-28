export interface CreateProductDto {
  sanPham: {
    tensanpham: string;
    danhmuc: string;
    thuonghieu?: string;
    model?: string;
    mota?: string;
    hinhanh?: string;
  };
  phanLoais: Array<{
    tenphanloai: string;
    sku?: string;
    mausac?: string;
    dungluong?: string;
    xuatxu?: string;
    loaiChiTiet?: string;
    nhaSanXuat?: string;
    tuongThich?: string;
    thongSoKyThuat?: string;
    gianhap: number;
    giaban: number;
    tonkho: number;
  }>;
  userId: number;
}
