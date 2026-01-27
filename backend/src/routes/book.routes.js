import express from "express";
import { getBooks } from "../controllers/book.controller.js";

const router = express.Router();

router.get("/books", (req, res) => {
  console.log("Books Route Called");
  getBooks(req, res);
});

export default router;
