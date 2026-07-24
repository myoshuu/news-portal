import { Router } from "express";
import { NewsController } from "@/controllers/news.controller";
import { authMiddleware, requireRole } from "@/middleware/auth.middleware";

const router = Router();
const controller = new NewsController();

// ===== PUBLIC ROUTES =====

// GET /api/news - Get all news (with pagination & filter)
router.get("/", controller.findAll.bind(controller));

// GET /api/news/slug/:slug - Get single news by slug
router.get("/slug/:slug", controller.findBySlug.bind(controller));

// GET /api/news/:id - Get single news by ID
router.get("/:id", controller.findById.bind(controller));

// ===== PROTECTED ROUTES (Writer/Admin) =====

// POST /api/news - Create news
router.post("/", authMiddleware, requireRole("writer", "admin"), controller.create.bind(controller));

// PUT /api/news/:id - Update news (author or admin only)
router.put("/:id", authMiddleware, controller.update.bind(controller));

// GET /api/news/my/list - Get my news (writer dashboard)
router.get("/my/list", authMiddleware, requireRole("writer", "admin"), controller.getMyNews.bind(controller));

// GET /api/news/my/delete-requests - Get my delete requests
router.get("/my/delete-requests", authMiddleware, requireRole("writer", "admin"), controller.getMyDeleteRequests.bind(controller));

// ===== DELETE REQUEST ROUTES =====

// POST /api/news/:id/request-delete - Request delete news (author only)
router.post("/:id/request-delete", authMiddleware, requireRole("writer", "admin"), controller.requestDelete.bind(controller));

// DELETE /api/news/:id/request-delete - Cancel delete request (request creator only)
router.delete("/:id/request-delete", authMiddleware, controller.cancelDeleteRequest.bind(controller));

// ===== ADMIN ONLY ROUTES =====

// GET /api/news/admin/delete-requests - Get pending delete requests
router.get("/admin/delete-requests", authMiddleware, requireRole("admin"), controller.getPendingDeleteRequests.bind(controller));

// POST /api/news/admin/delete-requests/:id/approve - Approve delete request
router.post("/admin/delete-requests/:id/approve", authMiddleware, requireRole("admin"), controller.approveDelete.bind(controller));

// POST /api/news/admin/delete-requests/:id/reject - Reject delete request
router.post("/admin/delete-requests/:id/reject", authMiddleware, requireRole("admin"), controller.rejectDelete.bind(controller));

// ===== USER INTERACTION ROUTES (All authenticated users) =====

// POST /api/news/:id/clap - Clap news
router.post("/:id/clap", authMiddleware, controller.clap.bind(controller));

// DELETE /api/news/:id/clap - Unclap news
router.delete("/:id/clap", authMiddleware, controller.unclap.bind(controller));

// POST /api/news/:id/save - Save news
router.post("/:id/save", authMiddleware, controller.save.bind(controller));

// DELETE /api/news/:id/save - Unsave news
router.delete("/:id/save", authMiddleware, controller.unsave.bind(controller));

export default router;
