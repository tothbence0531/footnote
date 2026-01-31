import { AppError } from "./appError.js";

export class InvalidCredentialsError extends AppError {
  constructor(message = "Invalid email or password") {
    super(message, 401, "INVALID_CREDENTIALS");
  }
}

export class InvalidRefreshTokenError extends AppError {
  constructor(message = "Invalid or expired refresh token") {
    super(message, 401, "INVALID_REFRESH_TOKEN");
  }
}

export class UserAlreadyExistsError extends AppError {
  constructor(message = "User already exists") {
    super(message, 409, "USER_ALREADY_EXISTS");
  }
}
