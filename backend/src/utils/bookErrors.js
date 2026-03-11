import { AppError } from "./appError.js";

export class MissingBookDataError extends AppError {
  constructor(message = "Missing book data") {
    super(message, 400, "MISSING_BOOK_DATA");
  }
}

export class InvalidBookImageError extends AppError {
  constructor(message = "Only JPEG, PNG, and WebP images are allowed") {
    super(message, 400, "INVALID_BOOK_IMAGE");
  }
}

export class BookNotFoundError extends AppError {
  constructor(message = "Book not found") {
    super(message, 404, "BOOK_NOT_FOUND");
  }
}

export class InvalidBookIdError extends AppError {
  constructor(message = "Invalid book ID") {
    super(message, 400, "INVALID_BOOK_ID");
  }
}

export class NotOwnerError extends AppError {
  constructor(message = "You are not the owner of this book") {
    super(message, 401, "NOT_OWNER");
  }
}
