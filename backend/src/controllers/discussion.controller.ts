import type { Request, Response } from "express";
import { DiscussionService } from "@/services/discussion.service";
import { createDiscussionSchema, updateDiscussionSchema } from "@news-portal/shared";

const service = new DiscussionService();

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

export class DiscussionController {
  async create(req: Request, res: Response) {
    const parsed = createDiscussionSchema.safeParse(req.body);
    if (!parsed.success) {
      validationError(res, parsed.error);
      return;
    }

    try {
      const newsId = getParam(req, "newsId");
      const userId = req.user!.userId;

      const discussion = await service.create({
        newsId,
        userId,
        comment: parsed.data.comment,
        parentId: parsed.data.parentId,
      });

      res.status(201).json({
        sukses: true,
        pesan: "Komentar berhasil diposting",
        data: discussion,
      });
    } catch (error: any) {
      const status = error.message.includes("tidak ditemukan") ? 404 : 400;
      res.status(status).json({
        sukses: false,
        pesan: error.message || "Gagal memposting komentar",
      });
    }
  }

  async findByNewsId(req: Request, res: Response) {
    try {
      const newsId = getParam(req, "newsId");
      const discussions = await service.findByNewsId(newsId);

      res.status(200).json({
        sukses: true,
        pesan: "Berhasil mengambil komentar",
        data: discussions,
      });
    } catch (error: any) {
      const status = error.message === "Berita tidak ditemukan" ? 404 : 500;
      res.status(status).json({
        sukses: false,
        pesan: error.message || "Gagal mengambil komentar",
      });
    }
  }

  async update(req: Request, res: Response) {
    const parsed = updateDiscussionSchema.safeParse(req.body);
    if (!parsed.success) {
      validationError(res, parsed.error);
      return;
    }

    try {
      const discussionId = getParam(req, "id");
      const requesterId = req.user!.userId;

      const discussion = await service.update(
        discussionId,
        { comment: parsed.data.comment },
        requesterId
      );

      res.status(200).json({
        sukses: true,
        pesan: "Komentar berhasil diperbarui",
        data: discussion,
      });
    } catch (error: any) {
      const status = error.message.includes("tidak ditemukan") ? 404 : 403;
      res.status(status).json({
        sukses: false,
        pesan: error.message || "Gagal memperbarui komentar",
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const discussionId = getParam(req, "id");
      const requesterId = req.user!.userId;
      const requesterRole = req.user!.role;

      await service.delete(discussionId, requesterId, requesterRole);

      res.status(200).json({
        sukses: true,
        pesan: "Komentar berhasil dihapus",
      });
    } catch (error: any) {
      if (error.message === "Komentar tidak ditemukan") {
        res.status(404).json({
          sukses: false,
          pesan: error.message,
        });
      } else if (error.message.includes("tidak memiliki izin")) {
        res.status(403).json({
          sukses: false,
          pesan: error.message,
        });
      } else {
        res.status(500).json({
          sukses: false,
          pesan: error.message || "Gagal menghapus komentar",
        });
      }
    }
  }
}
