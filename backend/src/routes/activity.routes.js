import express from "express";
import { getFeed, getUserFeed } from "../controllers/activity.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/feed", authMiddleware, getFeed);
router.get("/feed/user/:userId", authMiddleware, getUserFeed);

export default router;
