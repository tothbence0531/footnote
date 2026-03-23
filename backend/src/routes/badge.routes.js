import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getUserBadges, selectAllBadges } from "../daos/badge.dao.js";

const router = express.Router();

router.get("/badges/my", authMiddleware, async (req, res, next) => {
  try {
    const badges = await getUserBadges(req.user.userId);
    res.json(badges);
  } catch (err) {
    next(err);
  }
});

router.get("/badges/all", async (req, res, next) => {
  try {
    const badges = await selectAllBadges();
    res.json(badges);
  } catch (err) {
    next(err);
  }
});

export default router;
