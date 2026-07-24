import { z } from "zod";

// ===== NEWS SCHEMAS =====

// Create News Schema
export const createNewsSchema = z.object({
  title: z
    .string()
    .min(5, "Judul minimal 5 karakter")
    .max(200, "Judul maksimal 200 karakter"),
  artikel: z
    .string()
    .min(20, "Artikel minimal 20 karakter")
    .max(50000, "Artikel maksimal 50000 karakter"),
  foto: z.string().url("Format URL foto tidak valid").optional().or(z.literal("")),
  category: z.string().min(1, "Kategori diperlukan").optional(),
  tags: z.array(z.string().min(1).max(50)).max(10, "Maksimal 10 tag").optional().default([]),
});

export type CreateNewsInput = z.infer<typeof createNewsSchema>;

// Update News Schema
export const updateNewsSchema = z.object({
  title: z
    .string()
    .min(5, "Judul minimal 5 karakter")
    .max(200, "Judul maksimal 200 karakter")
    .optional(),
  artikel: z
    .string()
    .min(20, "Artikel minimal 20 karakter")
    .max(50000, "Artikel maksimal 50000 karakter")
    .optional(),
  foto: z.string().url("Format URL foto tidak valid").optional().or(z.literal("")).nullable(),
  category: z.string().min(1, "Kategori diperlukan").optional().nullable(),
  tags: z.array(z.string().min(1).max(50)).max(10, "Maksimal 10 tag").optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "Minimal satu field harus diisi untuk update" }
);

export type UpdateNewsInput = z.infer<typeof updateNewsSchema>;

// Request Delete Schema
export const requestDeleteNewsSchema = z.object({
  reason: z
    .string()
    .min(10, "Alasan minimal 10 karakter")
    .max(500, "Alasan maksimal 500 karakter"),
});

export type RequestDeleteNewsInput = z.infer<typeof requestDeleteNewsSchema>;

// Review Delete Schema (for admin approve/reject)
export const reviewDeleteSchema = z.object({
  reviewNote: z
    .string()
    .max(500, "Catatan maksimal 500 karakter")
    .optional(),
});

export type ReviewDeleteInput = z.infer<typeof reviewDeleteSchema>;

// News Query Schema
export const newsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().min(1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().min(1).max(100)),
  category: z.string().optional(),
  search: z.string().optional(),
});

export type NewsQueryInput = z.infer<typeof newsQuerySchema>;

// Export semua schemas
export const newsSchemas = {
  create: createNewsSchema,
  update: updateNewsSchema,
  requestDelete: requestDeleteNewsSchema,
  reviewDelete: reviewDeleteSchema,
  query: newsQuerySchema,
};

export default newsSchemas;
