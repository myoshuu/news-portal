import { Router } from "express";
import { AuthController } from "@/controllers/auth.controller";
import { authMiddleware } from "@/middleware/auth.middleware";

const router = Router();
const controller = new AuthController();

// POST /api/auth/register
router.post("/register", controller.register.bind(controller));

// POST /api/auth/login
router.post("/login", controller.login.bind(controller));

// POST /api/auth/change-password (protected)
router.post("/change-password", authMiddleware, controller.changePassword.bind(controller));

export default router;
