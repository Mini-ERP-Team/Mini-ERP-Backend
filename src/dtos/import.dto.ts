
export interface CreateImportDto {
    idnguoidung: number
    idnhacungcap: number;
    ghiChu?: string;
    maphieu?: string;
    chiTiet: {
        idphanloai: number;
        soluong: number;
        gianhap: number;
    }[];
}

export interface GetImportsInput {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}
