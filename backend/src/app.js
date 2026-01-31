import { configDotenv } from "dotenv";
configDotenv();
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import bookRoutes from "./routes/book.routes.js";
import authRoutes from "./routes/auth.routes.js";
import {
  errorMiddleware,
  notFoundHandler,
} from "./middlewares/error.middleware.js";
import { authLimiter, generalLimiter } from "./utils/rateLimiter.js";

const app = express();

// INFO: security middlewares
app.use(helmet());

// INFO: CORS
const allowedOrigins = ["http://localhost:4200"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// INFO: body parsing
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// INFO: Apply rate limiters
app.use("/api", generalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// INFO: API routes
app.use("/api", bookRoutes);
app.use("/api/auth", authRoutes);

// INFO: health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// INFO: error handling
app.use(notFoundHandler);
app.use(errorMiddleware);

export default app;
