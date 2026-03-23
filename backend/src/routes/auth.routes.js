import express from "express";
import * as authController from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "../schemas/auth.schema.js";
import db from "../config/db.js";

const router = express.Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

router.get("/me", authMiddleware, authController.me);

router.get("/users/me", authMiddleware, authController.getFullUser);

router.post("/users/wallet", authMiddleware, async (req, res, next) => {
  try {
    const { walletAddress } = req.body;
    await db.query("UPDATE users SET wallet_address = $1 WHERE id = $2", [
      walletAddress,
      req.user.userId,
    ]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
