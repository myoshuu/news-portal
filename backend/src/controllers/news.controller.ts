import type { Request, Response } from "express";
import { NewsService } from "@/services/news.service";
import {
  createNewsSchema,
  updateNewsSchema,
  requestDeleteNewsSchema,
  reviewDeleteSchema,
} from "@news-portal/shared";

const service = new NewsService();

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

export class NewsController {
  async create(req: Request, res: Response) {
    const parsed = createNewsSchema.safeParse(req.body);
    if (!parsed.success) {
      validationError(res, parsed.error);
      return;
    }

    try {
      const authorId = req.user!.userId;
      const news = await service.create({ ...parsed.data, authorId });

      res.status(201).json({
        sukses: true,
        pesan: "Berita berhasil dibuat",
        data: news,
      });
    } catch (error: any) {
      const status = error.message.includes("tidak ditemukan") || error.message.includes("hanya") ? 400 : 500;
      res.status(status).json({
        sukses: false,
        pesan: error.message || "Gagal membuat berita",
      });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, category, search } = req.query;

      const result = await service.findAll({
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        category: category as string | undefined,
        search: search as string | undefined,
      });

      res.status(200).json({
        sukses: true,
        pesan: "Berhasil mengambil daftar berita",
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        sukses: false,
        pesan: error.message || "Gagal mengambil daftar berita",
      });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const news = await service.findById(getParam(req, "id"));
      res.status(200).json({
        sukses: true,
        pesan: "Berhasil mengambil berita",
        data: news,
      });
    } catch (error: any) {
      const status = error.message === "Berita tidak ditemukan" ? 404 : 500;
      res.status(status).json({
        sukses: false,
        pesan: error.message || "Gagal mengambil berita",
      });
    }
  }

  async findBySlug(req: Request, res: Response) {
    try {
      const news = await service.findBySlug(getParam(req, "slug"));
      res.status(200).json({
        sukses: true,
        pesan: "Berhasil mengambil berita",
        data: news,
      });
    } catch (error: any) {
      const status = error.message === "Berita tidak ditemukan" ? 404 : 500;
      res.status(status).json({
        sukses: false,
        pesan: error.message || "Gagal mengambil berita",
      });
    }
  }

  async update(req: Request, res: Response) {
    const parsed = updateNewsSchema.safeParse(req.body);
    if (!parsed.success) {
      validationError(res, parsed.error);
      return;
    }

    try {
      const requesterId = req.user!.userId;
      const requesterRole = req.user!.role;

      const news = await service.update(
        getParam(req, "id"),
        parsed.data,
        requesterId,
        requesterRole
      );

      res.status(200).json({
        sukses: true,
        pesan: "Berita berhasil diperbarui",
        data: news,
      });
    } catch (error: any) {
      const status = error.message.includes("tidak ditemukan") ? 404 : 403;
      res.status(status).json({
        sukses: false,
        pesan: error.message || "Gagal memperbarui berita",
      });
    }
  }

  // ===== DELETE REQUEST ENDPOINTS =====

  async requestDelete(req: Request, res: Response) {
    const parsed = requestDeleteNewsSchema.safeParse(req.body);
    if (!parsed.success) {
      validationError(res, parsed.error);
      return;
    }

    try {
      const requesterId = req.user!.userId;
      const result = await service.requestDelete(getParam(req, "id"), requesterId, parsed.data.reason);

      res.status(200).json({
        sukses: true,
        pesan: "Request penghapusan berhasil diajukan dan menunggu persetujuan admin",
        data: result,
      });
    } catch (error: any) {
      const status = error.message.includes("tidak ditemukan") ? 404 : 400;
      res.status(status).json({
        sukses: false,
        pesan: error.message || "Gagal mengajukan request penghapusan",
      });
    }
  }

  async getPendingDeleteRequests(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const result = await service.getPendingDeleteRequests({
        page: Number(page) || 1,
        limit: Number(limit) || 10,
      });

      res.status(200).json({
        sukses: true,
        pesan: "Berhasil mengambil daftar request",
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        sukses: false,
        pesan: error.message || "Gagal mengambil daftar request",
      });
    }
  }

  async getMyDeleteRequests(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { page = 1, limit = 10 } = req.query;

      const result = await service.getMyDeleteRequests(userId, {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
      });

      res.status(200).json({
        sukses: true,
        pesan: "Berhasil mengambil daftar request Anda",
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        sukses: false,
        pesan: error.message || "Gagal mengambil daftar request",
      });
    }
  }

  async approveDelete(req: Request, res: Response) {
    const parsed = reviewDeleteSchema.safeParse(req.body);
    if (!parsed.success) {
      validationError(res, parsed.error);
      return;
    }

    try {
      const adminId = req.user!.userId;
      const result = await service.approveDelete(getParam(req, "id"), adminId, parsed.data.reviewNote);

      res.status(200).json({
        sukses: true,
        pesan: result.message,
      });
    } catch (error: any) {
      const status = error.message.includes("tidak ditemukan") ? 404 : 400;
      res.status(status).json({
        sukses: false,
        pesan: error.message || "Gagal menyetujui request",
      });
    }
  }

  async rejectDelete(req: Request, res: Response) {
    const parsed = reviewDeleteSchema.safeParse(req.body);
    if (!parsed.success) {
      validationError(res, parsed.error);
      return;
    }

    try {
      const adminId = req.user!.userId;
      const result = await service.rejectDelete(getParam(req, "id"), adminId, parsed.data.reviewNote);

      res.status(200).json({
        sukses: true,
        pesan: "Request ditolak",
        data: result,
      });
    } catch (error: any) {
      const status = error.message.includes("tidak ditemukan") ? 404 : 400;
      res.status(status).json({
        sukses: false,
        pesan: error.message || "Gagal menolak request",
      });
    }
  }

  async cancelDeleteRequest(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const result = await service.cancelDeleteRequest(getParam(req, "id"), userId);

      res.status(200).json({
        sukses: true,
        pesan: result.message,
      });
    } catch (error: any) {
      const status = error.message.includes("tidak ditemukan") ? 404 : 400;
      res.status(status).json({
        sukses: false,
        pesan: error.message || "Gagal membatalkan request",
      });
    }
  }

  // ===== CLAP & SAVE ENDPOINTS =====

  async clap(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const newsId = getParam(req, "id");

      const result = await service.clap(newsId, userId);
      res.status(200).json({
        sukses: true,
        pesan: result.message,
      });
    } catch (error: any) {
      const status = error.message.includes("tidak ditemukan") ? 404 : 400;
      res.status(status).json({
        sukses: false,
        pesan: error.message || "Gagal memberi tepuk tangan",
      });
    }
  }

  async unclap(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const newsId = getParam(req, "id");

      const result = await service.unclap(newsId, userId);
      res.status(200).json({
        sukses: true,
        pesan: result.message,
      });
    } catch (error: any) {
      const status = error.message.includes("tidak ditemukan") ? 404 : 400;
      res.status(status).json({
        sukses: false,
        pesan: error.message || "Gagal menghapus tepuk tangan",
      });
    }
  }

  async save(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const newsId = getParam(req, "id");

      const result = await service.save(newsId, userId);
      res.status(200).json({
        sukses: true,
        pesan: result.message,
      });
    } catch (error: any) {
      const status = error.message.includes("tidak ditemukan") ? 404 : 400;
      res.status(status).json({
        sukses: false,
        pesan: error.message || "Gagal menyimpan berita",
      });
    }
  }

  async unsave(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const newsId = getParam(req, "id");

      const result = await service.unsave(newsId, userId);
      res.status(200).json({
        sukses: true,
        pesan: result.message,
      });
    } catch (error: any) {
      const status = error.message.includes("tidak ditemukan") ? 404 : 400;
      res.status(status).json({
        sukses: false,
        pesan: error.message || "Gagal menghapus berita dari tersimpan",
      });
    }
  }

  async getMyNews(req: Request, res: Response) {
    try {
      const authorId = req.user!.userId;
      const { page = 1, limit = 10 } = req.query;

      const news = await service.findByAuthor(authorId, {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
      });

      res.status(200).json({
        sukses: true,
        pesan: "Berhasil mengambil berita Anda",
        data: news,
      });
    } catch (error: any) {
      res.status(500).json({
        sukses: false,
        pesan: error.message || "Gagal mengambil berita",
      });
    }
  }
}
