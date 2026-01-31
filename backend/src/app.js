import { configDotenv } from "dotenv";
configDotenv();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bookRoutes from "./routes/book.routes.js";
import authRoutes from "./routes/auth.routes.js";
import {
  errorMiddleware,
  notFoundHandler,
} from "./middlewares/error.middleware.js";

const app = express();

app.use(cookieParser());
app.use(cors());
app.use(express.json());

app.use("/api", bookRoutes);
app.use("/api/auth", authRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use(notFoundHandler);
app.use(errorMiddleware);

export default app;
