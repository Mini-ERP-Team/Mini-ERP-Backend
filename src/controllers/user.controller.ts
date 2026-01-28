import type { Request, Response } from 'express';
import * as userService from '../services/user.service.js';

export const addUser = async (req: Request, res: Response) => {
  try {
    const { hoten, mail, matkhau, vaitro } = req.body ?? {};

    if (!hoten || !mail || !matkhau || !vaitro) {
      return res.status(400).json({
        message: "Thiếu thông tin bắt buộc: hoten, mail, matkhau, vaitro",
      });
    }

    const newUser = await userService.createNewUser(req.body);

    return res.status(201).json({
      message: "Tạo nhân viên thành công",
      data: newUser
    });

  } catch (e: any) {
    if (e?.code === "P2002") {
       return res.status(409).json({ message: "Dữ liệu bị trùng (Email/Mã NV)" });
    }
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
}

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();

    return res.status(200).json({
      message: "Lấy danh sách nhân viên thành công",
      data: users,
    });
  } catch (error) {
    console.error("Get Users Error:", error);
    return res.status(500).json({ message: "Lỗi hệ thống khi lấy danh sách user" });
  }
};

export const updateStatus = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        message: "ID là bắt buộc",
      });
    }
    
    const payload = req.body;
    const updated = await userService.updateStatus(id, payload);
    return res.status(200).json({ message: "Cập nhật user thành công", data: updated });
  } catch (error) {
    // xử lý lỗi tương tự addUser
  }
};

export const updateUser = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "ID là bắt buộc" });
    }

    const { hoten, mail, vaitro, sdt, trangthai, anhdaidien } = req.body ?? {};

    // Validate tối thiểu (bạn muốn bắt buộc field nào thì check thêm)
    if (hoten !== undefined && String(hoten).trim().length === 0) {
      return res.status(400).json({ message: "hoten không được rỗng" });
    }
    if (mail !== undefined && String(mail).trim().length === 0) {
      return res.status(400).json({ message: "mail không được rỗng" });
    }

    if (vaitro !== undefined) {
      const r = String(vaitro).toUpperCase();
      if (!["ADMIN", "STAFF"].includes(r)) {
        return res.status(400).json({ message: "vaitro không hợp lệ (ADMIN|STAFF)" });
      }
    }

    const updated = await userService.updateUser(id, {
      hoten,
      mail,
      vaitro,
      sdt,
      trangthai,
      anhdaidien,
    });

    return res.status(200).json({ message: "Cập nhật user thành công", data: updated });

  } catch (e: any) {
    if (e?.code === "P2002") {
      return res.status(409).json({ message: "Dữ liệu bị trùng (Email/Mã NV)" });
    }
    if (e?.code === "P2025") {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }
    console.error("Update User Error:", e);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
