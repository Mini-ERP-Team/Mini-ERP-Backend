export interface CreateSupplierDto {
  tennhacungcap: string;
  manhacungcap?: string;
  nguoiLienHe?: string;
  chucVu?: string;
  loaiHang?: string;
  email?: string;
  sdt?: string;
  diachi?: string;
  masothue?: string;
  trangthai?: boolean;
}

export interface GetSuppliersInput {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}
