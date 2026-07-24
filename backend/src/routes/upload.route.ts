import { Router, type Request, type Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authMiddleware, requireRole } from "@/middleware/auth.middleware";

const router = Router();

// Pastikan folder uploads ada
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      return cb(new Error("Hanya file gambar yang diperbolehkan (JPEG, JPG, PNG, WEBP, GIF)"));
    }
  },
});

router.post(
  "/",
  authMiddleware,
  requireRole("writer", "admin"),
  upload.single("image"),
  (req: Request, res: Response): void => {
    try {
      if (!req.file) {
        res.status(400).json({ sukses: false, pesan: "Tidak ada file gambar yang diunggah" });
        return;
      }

      // Generate the public URL for the uploaded file
      // URL relative /uploads/filename
      const protocol = req.protocol;
      const host = req.get("host");
      const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

      res.status(200).json({
        sukses: true,
        pesan: "Gambar berhasil diunggah",
        url: imageUrl,
      });
    } catch (error: any) {
      console.error("Error uploading file:", error);
      res.status(500).json({
        sukses: false,
        pesan: error.message || "Gagal mengunggah gambar",
      });
    }
  }
);

export default router;
