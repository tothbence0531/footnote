import express from "express";
import {
  getBooks,
  getOwnedUserBooks,
  getReadUserBooks,
  getAllUserBooks,
} from "../controllers/book.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.get("/books", authMiddleware, getBooks);
router.get("/books/user/owned", authMiddleware, getOwnedUserBooks);
router.get("/books/user/read", authMiddleware, getReadUserBooks);
router.get("/books/user/all", authMiddleware, getAllUserBooks);

export default router;
