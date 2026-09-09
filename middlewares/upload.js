import multer from "multer";
import path from "path";
import fs from "fs";
import slugify from "slugify";

const uploadDir = path.join(process.cwd(), "uploads/images");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const allowedMime = new Set(["image/jpeg", "image/png", "image/webp", "image/jpg"]);
const allowedExt = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const rawSlug = req.slug || req.params.slug || req.body.slug || "image";
    const slug = slugify(String(rawSlug), { lower: true, strict: true }) || "image";
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = allowedExt.has(ext) ? ext : ".jpg";
    cb(null, `${slug}-${uniqueSuffix}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!allowedMime.has(file.mimetype)) {
      return cb(new Error("Invalid file type. Only jpeg, png, webp allowed"), false);
    }
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExt.has(ext)) {
      return cb(new Error("Invalid file extension"), false);
    }
    cb(null, true);
  },
});

export default upload;
