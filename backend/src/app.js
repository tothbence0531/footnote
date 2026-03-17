import { configDotenv } from "dotenv";
configDotenv();
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import bookRoutes from "./routes/book.routes.js";
import authRoutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/event.routes.js";
import {
  errorMiddleware,
  notFoundHandler,
} from "./middlewares/error.middleware.js";
import { authLimiter, generalLimiter } from "./utils/rateLimiter.js";
import path from "path";
import { fileURLToPath } from "url";
import activityRoutes from "./routes/activity.routes.js";
import { getOnChainNonce } from "./services/blockchain.service.js";
import { authMiddleware } from "./middlewares/auth.middleware.js";

const app = express();

// INFO: files and folders for static assets
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// INFO: static assets
app.use(
  "/api/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "../uploads")),
);

app.use(
  "/api/uploads/events",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "../uploads/events")),
);

app.use("/api", eventRoutes);

// INFO: API routes
app.use("/api", bookRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/activity", activityRoutes);

// INFO: health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// INFO: blockchain routes
app.get("/api/blockchain/nonce/:address", async (req, res, next) => {
  try {
    const nonce = await getOnChainNonce(req.params.address);
    res.json({ nonce });
  } catch (err) {
    next(err);
  }
});

// INFO: error handling
app.use(notFoundHandler);
app.use(errorMiddleware);

export default app;
