import { Router } from "express";
import { UserController } from "@/controllers/user.controller";
import { authMiddleware, requireRole } from "@/middleware/auth.middleware";

const router = Router();
const controller = new UserController();

// GET /api/users - Get all users (admin only)
router.get("/", authMiddleware, requireRole("admin"), controller.findAll.bind(controller));

// GET /api/users/saved - Get saved news (user)
router.get("/saved", authMiddleware, controller.getSavedNews.bind(controller));

// GET /api/users/clapped - Get clapped news (user)
router.get("/clapped", authMiddleware, controller.getClappedNews.bind(controller));

// GET /api/users/profile - Get own profile
router.get("/profile", authMiddleware, (req, res) => {
  controller.findById(req, res);
});

// PUT /api/users/profile - Update own profile
router.put("/profile", authMiddleware, controller.updateProfile.bind(controller));

// GET /api/users/:id - Get user by ID (admin only)
router.get("/:id", authMiddleware, requireRole("admin"), controller.findById.bind(controller));

// PUT /api/users/role - Update user role (admin only)
router.put("/role", authMiddleware, requireRole("admin"), controller.updateRole.bind(controller));

// POST /api/users/saved/:newsId - Save news
router.post("/saved/:newsId", authMiddleware, controller.saveNews.bind(controller));

// DELETE /api/users/saved/:newsId - Unsave news
router.delete("/saved/:newsId", authMiddleware, controller.unsaveNews.bind(controller));

// POST /api/users/clap/:newsId - Clap news
router.post("/clap/:newsId", authMiddleware, controller.clapNews.bind(controller));

// DELETE /api/users/clap/:newsId - Unclap news
router.delete("/clap/:newsId", authMiddleware, controller.unclapNews.bind(controller));

export default router;
