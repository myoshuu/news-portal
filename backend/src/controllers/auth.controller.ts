import type { Request, Response } from "express";
import { AuthService } from "@/services/auth.service";
import { registerSchema, loginSchema, changePasswordSchema } from "@news-portal/shared";

const service = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        sukses: false,
        pesan: "Validasi gagal",
        kesalahan: parsed.error.format(),
      });
      return;
    }

    try {
      const user = await service.register(parsed.data);
      res.status(201).json({
        sukses: true,
        pesan: "Registrasi berhasil",
        data: user,
      });
    } catch (error: any) {
      res.status(400).json({
        sukses: false,
        pesan: error.message || "Registrasi gagal",
      });
    }
  }

  async login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        sukses: false,
        pesan: "Validasi gagal",
        kesalahan: parsed.error.format(),
      });
      return;
    }

    try {
      const result = await service.login(parsed.data);
      res.status(200).json({
        sukses: true,
        pesan: "Login berhasil",
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        sukses: false,
        pesan: error.message || "Login gagal",
      });
    }
  }

  async changePassword(req: Request, res: Response) {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        sukses: false,
        pesan: "Validasi gagal",
        kesalahan: parsed.error.format(),
      });
      return;
    }

    try {
      const userId = req.user!.userId;
      const result = await service.changePassword(
        userId,
        parsed.data.currentPassword,
        parsed.data.newPassword
      );
      res.status(200).json({
        sukses: true,
        pesan: result.message,
      });
    } catch (error: any) {
      res.status(400).json({
        sukses: false,
        pesan: error.message || "Gagal mengubah password",
      });
    }
  }
}
