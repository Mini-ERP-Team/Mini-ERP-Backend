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
