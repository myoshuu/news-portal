import { z } from "zod";

// ===== CATEGORY SCHEMAS =====

// Create Category Schema
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Nama kategori minimal 2 karakter")
    .max(100, "Nama kategori maksimal 100 karakter"),
  description: z
    .string()
    .max(500, "Deskripsi maksimal 500 karakter")
    .optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

// Update Category Schema
export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Nama kategori minimal 2 karakter")
    .max(100, "Nama kategori maksimal 100 karakter")
    .optional(),
  description: z
    .string()
    .max(500, "Deskripsi maksimal 500 karakter")
    .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "Minimal satu field harus diisi untuk update" }
);

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

// Export semua schemas
export const categorySchemas = {
  create: createCategorySchema,
  update: updateCategorySchema,
};

export default categorySchemas;
