import { AppError } from "../utils/appError.js";

export function errorMiddleware(err, req, res, next) {
  if (process.env.NODE_ENV !== "production") {
    console.error("ERROR Details:", {
      name: err.name,
      code: err.code,
      message: err.message,
      errno: err.errno,
    });
  }

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
      },
    });
  }

  // Validation errors
  if (err.errCode === "VALIDATION_ERROR") {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation error",
        details: err.details.map((d) => ({
          field: d.path[0],
          message: d.message,
        })),
      },
    });
  }

  // Database errors

  if (
    err.code === "ECONNREFUSED" ||
    err.code === "ENOTFOUND" ||
    err.errno === -111 ||
    err.code === "PROTOCOL_CONNECTION_LOST" ||
    err.message?.includes("connect ECONNREFUSED") ||
    err.message?.includes("Connection terminated")
  ) {
    // Database connection errors
    return res.status(503).json({
      success: false,
      error: {
        code: "DATABASE_UNAVAILABLE",
        message:
          "Database connection failed. Please ensure PostgreSQL is running.",
      },
    });
  }

  if (err.code === "23505") {
    // PostgreSQL unique violation
    return res.status(409).json({
      success: false,
      error: {
        code: "DUPLICATE_ENTRY",
        message: "Resource already exists",
      },
    });
  }

  if (err.code?.startsWith("23")) {
    return res.status(400).json({
      success: false,
      error: {
        code: "DATABASE_CONSTRAINT_ERROR",
        message: "Database constraint violation",
      },
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      error: {
        code: "INVALID_TOKEN",
        message: "Invalid token",
      },
    });
  }

  // Unexpected error (programming error)
  console.error("ERROR:", err);

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message:
        process.env.NODE_ENV === "production"
          ? "Something went wrong"
          : err.message,
    },
  });
}

// 404 handler
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
    },
  });
}
