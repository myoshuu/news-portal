import express from "express";
import cors from "cors";
import authRoutes from "@/routes/auth.route";
import userRoutes from "@/routes/user.route";
import categoryRoutes from "@/routes/category.route";
import newsRoutes from "@/routes/news.route";
import discussionRoutes, { discussionDeleteRouter, discussionUpdateRouter } from "@/routes/discussion.route";
import uploadRoutes from "@/routes/upload.route";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// API Routes
app.use("/api/upload", uploadRoutes);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/news", newsRoutes);

// Nested: GET /api/news/:newsId/discussions and POST /api/news/:newsId/discussions
app.use("/api/news/:newsId/discussions", discussionRoutes);

// PUT /api/discussions/:id - Update comment
app.use("/api/discussions", discussionUpdateRouter);

// DELETE /api/discussions/:id - Delete comment
app.use("/api/discussions", discussionDeleteRouter);

// General error-handling middleware (must be last)
app.use((err: any, req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({
    sukses: false,
    pesan: "Terjadi kesalahan pada server",
  });
});

export default app;
