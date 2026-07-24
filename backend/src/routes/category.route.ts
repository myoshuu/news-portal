import { Router } from "express";
import { CategoryController } from "@/controllers/category.controller";
import { authMiddleware, requireRole } from "@/middleware/auth.middleware";

const router = Router();
const controller = new CategoryController();

// GET /api/categories - Get all categories (public)
router.get("/", controller.findAll.bind(controller));

// GET /api/categories/:id - Get category by ID (public)
router.get("/:id", controller.findById.bind(controller));

// POST /api/categories - Create category (admin only)
router.post("/", authMiddleware, requireRole("admin"), controller.create.bind(controller));

// PUT /api/categories/:id - Update category (admin only)
router.put("/:id", authMiddleware, requireRole("admin"), controller.update.bind(controller));

// DELETE /api/categories/:id - Delete category (admin only)
router.delete("/:id", authMiddleware, requireRole("admin"), controller.delete.bind(controller));

// PATCH /api/categories/:id/toggle - Toggle category active status (admin only)
router.patch("/:id/toggle", authMiddleware, requireRole("admin"), controller.toggleActive.bind(controller));

export default router;
