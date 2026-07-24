import type { Request, Response } from "express";
import { UserService } from "@/services/user.service";
import {
  updateProfileSchema,
  updateUserRoleSchema,
  getUsersQuerySchema,
} from "@news-portal/shared";

const service = new UserService();

// Helper to get string from params
const getParam = (req: Request, key: string): string => {
  const val = req.params[key];
  if (Array.isArray(val)) return val[0] || "";
  return val || "";
};

// Helper for validation error response
const validationError = (res: Response, error: any) => {
  res.status(400).json({
    sukses: false,
    pesan: "Validasi gagal",
    kesalahan: error.format?.() || error.errors || error.message,
  });
};

export class UserController {
  // Get all users (admin only)
  async findAll(req: Request, res: Response) {
    const parsed = getUsersQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      validationError(res, parsed.error);
      return;
    }

    try {
      const result = await service.findAll(parsed.data);
      res.status(200).json({
        sukses: true,
        pesan: "Berhasil mengambil daftar pengguna",
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        sukses: false,
        pesan: error.message || "Gagal mengambil daftar pengguna",
      });
    }
  }

  // Get user by ID
  async findById(req: Request, res: Response) {
    try {
      const user = await service.findById(getParam(req, "id"));
      res.status(200).json({
        sukses: true,
        pesan: "Berhasil mengambil data pengguna",
        data: user,
      });
    } catch (error: any) {
      const status = error.message === "Pengguna tidak ditemukan" ? 404 : 500;
      res.status(status).json({
        sukses: false,
        pesan: error.message || "Gagal mengambil data pengguna",
      });
    }
  }

  // Update user role (admin only)
  async updateRole(req: Request, res: Response) {
    const parsed = updateUserRoleSchema.safeParse(req.body);
    if (!parsed.success) {
      validationError(res, parsed.error);
      return;
    }

    try {
      const adminId = req.user!.userId;
      const user = await service.updateRole(parsed.data.userId, parsed.data.role, adminId);

      res.status(200).json({
        sukses: true,
        pesan: "Role berhasil diperbarui",
        data: user,
      });
    } catch (error: any) {
      const status = error.message.includes("tidak ditemukan") ? 404 : 400;
      res.status(status).json({
        sukses: false,
        pesan: error.message || "Gagal memperbarui role",
      });
    }
  }

  // Update own profile
  async updateProfile(req: Request, res: Response) {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      validationError(res, parsed.error);
      return;
    }

    try {
      const userId = req.user!.userId;
      const user = await service.updateProfile(userId, parsed.data);

      res.status(200).json({
        sukses: true,
        pesan: "Profil berhasil diperbarui",
        data: user,
      });
    } catch (error: any) {
      const status = error.message.includes("tidak ditemukan") ? 404 : 400;
      res.status(status).json({
        sukses: false,
        pesan: error.message || "Gagal memperbarui profil",
      });
    }
  }

  // Get saved news
  async getSavedNews(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const news = await service.getSavedNews(userId);

      res.status(200).json({
        sukses: true,
        pesan: "Berhasil mengambil berita tersimpan",
        data: news,
      });
    } catch (error: any) {
      res.status(500).json({
        sukses: false,
        pesan: error.message || "Gagal mengambil berita tersimpan",
      });
    }
  }

  // Save news
  async saveNews(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const newsId = getParam(req, "newsId");

      const result = await service.saveNews(userId, newsId);
      res.status(200).json({
        sukses: true,
        pesan: result.message,
      });
    } catch (error: any) {
      const status = error.message.includes("sudah") ? 400 : 500;
      res.status(status).json({
        sukses: false,
        pesan: error.message || "Gagal menyimpan berita",
      });
    }
  }

  // Unsave news
  async unsaveNews(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const newsId = getParam(req, "newsId");

      const result = await service.unsaveNews(userId, newsId);
      res.status(200).json({
        sukses: true,
        pesan: result.message,
      });
    } catch (error: any) {
      const status = error.message.includes("belum") ? 400 : 500;
      res.status(status).json({
        sukses: false,
        pesan: error.message || "Gagal menghapus berita dari tersimpan",
      });
    }
  }

  // Get clapped news
  async getClappedNews(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const news = await service.getClappedNews(userId);

      res.status(200).json({
        sukses: true,
        pesan: "Berhasil mengambil berita yang ditambahkan tepuk tangan",
        data: news,
      });
    } catch (error: any) {
      res.status(500).json({
        sukses: false,
        pesan: error.message || "Gagal mengambil berita",
      });
    }
  }

  // Clap news
  async clapNews(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const newsId = getParam(req, "newsId");

      const result = await service.clapNews(userId, newsId);
      res.status(200).json({
        sukses: true,
        pesan: result.message,
      });
    } catch (error: any) {
      const status = error.message.includes("sudah") ? 400 : 500;
      res.status(status).json({
        sukses: false,
        pesan: error.message || "Gagal memberi tepuk tangan",
      });
    }
  }

  // Unclap news
  async unclapNews(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const newsId = getParam(req, "newsId");

      const result = await service.unclapNews(userId, newsId);
      res.status(200).json({
        sukses: true,
        pesan: result.message,
      });
    } catch (error: any) {
      const status = error.message.includes("belum") ? 400 : 500;
      res.status(status).json({
        sukses: false,
        pesan: error.message || "Gagal menghapus tepuk tangan",
      });
    }
  }
}
