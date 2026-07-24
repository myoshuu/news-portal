import { Router } from "express";
import { DiscussionController } from "@/controllers/discussion.controller";
import { authMiddleware } from "@/middleware/auth.middleware";

const router = Router({ mergeParams: true });
const controller = new DiscussionController();

// Public route
// GET /api/news/:newsId/discussions - Get all discussions for a news article
router.get("/", controller.findByNewsId.bind(controller));

// Protected routes (require JWT)
// POST /api/news/:newsId/discussions - Post a new comment on a news article
router.post("/", authMiddleware, controller.create.bind(controller));

// DELETE /api/discussions/:id - Delete a comment (owner or admin)
export const discussionDeleteRouter = Router();
discussionDeleteRouter.delete("/:id", authMiddleware, controller.delete.bind(controller));

// PUT /api/discussions/:id - Update a comment (owner only)
export const discussionUpdateRouter = Router();
discussionUpdateRouter.put("/:id", authMiddleware, controller.update.bind(controller));

export default router;
