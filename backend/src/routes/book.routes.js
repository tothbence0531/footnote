import express from "express";
import {
  getOwnedUserBooks,
  getReadUserBooks,
  getAllUserBooks,
  addOwnedBook,
  getBookWithEvents,
  deleteBook,
} from "../controllers/book.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { uploadCoverImage } from "../controllers/book.controller.js";
import { upload } from "../config/multer.js";

const router = express.Router();

router.get("/books/user/owned", authMiddleware, getOwnedUserBooks);
router.get("/books/user/read", authMiddleware, getReadUserBooks);
router.get("/books/user/all", authMiddleware, getAllUserBooks);
router.get("/books/:id", getBookWithEvents);

router.post("/books", authMiddleware, addOwnedBook);
router.post(
  "/books/upload-cover",
  authMiddleware,
  upload.single("cover"),
  uploadCoverImage,
);

router.delete("/books/:id", authMiddleware, deleteBook);

export default router;
