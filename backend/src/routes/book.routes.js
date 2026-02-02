import express from "express";
import { getBooks } from "../controllers/book.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/books", authMiddleware, (req, res) => {
  getBooks(req, res);
});

export default router;
