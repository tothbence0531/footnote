import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getUserBadges, selectAllBadges } from "../daos/badge.dao.js";
import db from "../config/db.js";

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

router.get("/badges/:id.json", async (req, res) => {
  const badge = await db.query(
    "SELECT name, image_url FROM badges WHERE id = $1",
    [req.params.id],
  );
  if (!badge.rows.length) return res.status(404).json({ error: "Not found" });

  res.json({
    name: badge.rows[0].name,
    description: `Footnote badge: ${badge.rows[0].name}`,
    image: process.env.DOMAIN + "/api/uploads/" + badge.rows[0].image_url,
  });
});

export default router;
