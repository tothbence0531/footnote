import express from "express";
import cors from "cors";
import bookRoutes from "./routes/book.routes.js";
import { configDotenv } from "dotenv";

const app = express();

configDotenv();

app.use(cors());
app.use(express.json());

app.use("/api", bookRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

export default app;
