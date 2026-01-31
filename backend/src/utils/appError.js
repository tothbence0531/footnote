export class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true; // operational vs programming error
    Error.captureStackTrace(this, this.constructor);
  }
}
