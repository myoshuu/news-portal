import { z } from "zod";

// ===== DISCUSSION SCHEMAS =====

// Create Discussion Schema (comment or reply)
export const createDiscussionSchema = z.object({
  comment: z
    .string()
    .min(1, "Komentar tidak boleh kosong")
    .max(2000, "Komentar maksimal 2000 karakter"),
  parentId: z
    .string()
    .min(1, "Parent ID tidak valid")
    .optional(),
});

export type CreateDiscussionInput = z.infer<typeof createDiscussionSchema>;

// Update Discussion Schema
export const updateDiscussionSchema = z.object({
  comment: z
    .string()
    .min(1, "Komentar tidak boleh kosong")
    .max(2000, "Komentar maksimal 2000 karakter"),
});

export type UpdateDiscussionInput = z.infer<typeof updateDiscussionSchema>;

// Export semua schemas
export const discussionSchemas = {
  create: createDiscussionSchema,
  update: updateDiscussionSchema,
};

export default discussionSchemas;
