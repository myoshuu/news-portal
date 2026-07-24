import { z } from "zod";

// Enum untuk role
export const UserRole = z.enum(["admin", "writer", "user"]);
export type UserRole = z.infer<typeof UserRole>;

// Register Schema
export const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(100, "Nama lengkap maksimal 100 karakter"),
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(30, "Username maksimal 30 karakter")
    .regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh huruf, angka, dan underscore"),
  email: z
    .string()
    .email("Format email tidak valid")
    .min(5, "Email minimal 5 karakter")
    .max(100, "Email maksimal 100 karakter"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(100, "Password maksimal 100 karakter")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password harus mengandung huruf besar, huruf kecil, dan angka"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// Login Schema
export const loginSchema = z.object({
  email: z
    .string()
    .email("Format email tidak valid")
    .min(5, "Email minimal 5 karakter"),
  password: z
    .string()
    .min(1, "Password tidak boleh kosong"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Update User Profile Schema (untuk user update profile sendiri)
export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(100, "Nama lengkap maksimal 100 karakter")
    .optional(),
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(30, "Username maksimal 30 karakter")
    .regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh huruf, angka, dan underscore")
    .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "Minimal satu field harus diisi untuk update" }
);

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// Change Password Schema
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Password saat ini tidak boleh kosong"),
  newPassword: z
    .string()
    .min(8, "Password baru minimal 8 karakter")
    .max(100, "Password baru maksimal 100 karakter")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password harus mengandung huruf besar, huruf kecil, dan angka"),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// ===== ADMIN SCHEMAS =====

// Update User Role Schema (untuk admin mengubah role user)
export const updateUserRoleSchema = z.object({
  userId: z.string().min(1, "User ID diperlukan"),
  role: UserRole,
  reason: z
    .string()
    .max(500, "Alasan maksimal 500 karakter")
    .optional(),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;

// Get All Users Query Schema
export const getUsersQuerySchema = z.object({
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
  role: z
    .string()
    .optional()
    .transform((val) => val as UserRole | undefined),
  search: z.string().optional(),
});

export type GetUsersQueryInput = z.infer<typeof getUsersQuerySchema>;

// Get User By ID Schema
export const getUserByIdSchema = z.object({
  userId: z.string().min(1, "User ID diperlukan"),
});

export type GetUserByIdInput = z.infer<typeof getUserByIdSchema>;

// Export semua schemas
export const userSchemas = {
  register: registerSchema,
  login: loginSchema,
  updateProfile: updateProfileSchema,
  changePassword: changePasswordSchema,
  updateUserRole: updateUserRoleSchema,
  getUsersQuery: getUsersQuerySchema,
  getUserById: getUserByIdSchema,
};

export default userSchemas;
