import type { Request, Response } from "express";
import { CategoryService } from "@/services/category.service";
import { createCategorySchema, updateCategorySchema } from "@news-portal/shared";

const service = new CategoryService();

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

export class CategoryController {
  async create(req: Request, res: Response) {
    const parsed = createCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      validationError(res, parsed.error);
      return;
    }

    try {
      const createdBy = req.user!.userId;
      const category = await service.create(parsed.data, createdBy);

      res.status(201).json({
        sukses: true,
        pesan: "Kategori berhasil dibuat",
        data: category,
      });
    } catch (error: any) {
      const status = error.message.includes("sudah ada") ? 400 : 500;
      res.status(status).json({
        sukses: false,
        pesan: error.message || "Gagal membuat kategori",
      });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const includeInactive = req.user?.role === "admin" && req.query["includeInactive"] === "true";
      const categories = await service.findAll(includeInactive);

      res.status(200).json({
        sukses: true,
        pesan: "Berhasil mengambil daftar kategori",
        data: categories,
      });
    } catch (error: any) {
      res.status(500).json({
        sukses: false,
        pesan: error.message || "Gagal mengambil daftar kategori",
      });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const category = await service.findById(getParam(req, "id"));
      res.status(200).json({
        sukses: true,
        pesan: "Berhasil mengambil kategori",
        data: category,
      });
    } catch (error: any) {
      const status = error.message === "Kategori tidak ditemukan" ? 404 : 500;
      res.status(status).json({
        sukses: false,
        pesan: error.message || "Gagal mengambil kategori",
      });
    }
  }

  async update(req: Request, res: Response) {
    const parsed = updateCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      validationError(res, parsed.error);
      return;
    }

    try {
      const category = await service.update(getParam(req, "id"), parsed.data);

      res.status(200).json({
        sukses: true,
        pesan: "Kategori berhasil diperbarui",
        data: category,
      });
    } catch (error: any) {
      const status = error.message.includes("tidak ditemukan") ? 404 : 400;
      res.status(status).json({
        sukses: false,
        pesan: error.message || "Gagal memperbarui kategori",
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await service.delete(getParam(req, "id"));
      res.status(200).json({
        sukses: true,
        pesan: "Kategori berhasil dihapus",
      });
    } catch (error: any) {
      const status = error.message === "Kategori tidak ditemukan" ? 404 : 500;
      res.status(status).json({
        sukses: false,
        pesan: error.message || "Gagal menghapus kategori",
      });
    }
  }

  async toggleActive(req: Request, res: Response) {
    try {
      const result = await service.toggleActive(getParam(req, "id"));
      res.status(200).json({
        sukses: true,
        pesan: result.message,
        data: { isActive: result.isActive },
      });
    } catch (error: any) {
      const status = error.message === "Kategori tidak ditemukan" ? 404 : 500;
      res.status(status).json({
        sukses: false,
        pesan: error.message || "Gagal mengubah status kategori",
      });
    }
  }
}
