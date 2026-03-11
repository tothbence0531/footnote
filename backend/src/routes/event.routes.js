import express from "express";
import { createEvent } from "../controllers/event.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../config/multer.js";

const router = express.Router();

router.post("/events", authMiddleware, upload.array("images", 3), createEvent);

export default router;
