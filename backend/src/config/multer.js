import multer from "multer";
import path from "path";
import fs from "fs";
import { InvalidBookImageError } from "../utils/bookErrors.js";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const UPLOAD_DIRS = {
  covers: "uploads/covers",
  events: "uploads/events",
};

Object.values(UPLOAD_DIRS).forEach(ensureDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isEvent = req.path.includes("events") || req.url.includes("events");
    cb(null, isEvent ? UPLOAD_DIRS.events : UPLOAD_DIRS.covers);
  },
  filename: (req, file, cb) => {
    const isEvent = req.path.includes("events") || req.url.includes("events");
    const prefix = isEvent ? "event" : "cover";
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${prefix}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new InvalidBookImageError(), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
