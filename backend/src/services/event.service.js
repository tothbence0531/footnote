import crypto from "crypto";
import * as eventDao from "../daos/event.dao.js";
import * as userDao from "../daos/user.dao.js";
import * as booksDao from "../daos/book.dao.js";
import { UserNotFoundError } from "../utils/authErrors.js";
import {
  BookNotFoundError,
  MissingBookDataError,
} from "../utils/bookErrors.js";

export async function addEvent(eventData, files) {
  const userExists = await userDao.selectUserById(eventData.user_id);
  if (!userExists) throw new UserNotFoundError();

  const bookExists = await booksDao.selectBookById(eventData.book_id);
  if (!bookExists) throw new BookNotFoundError();

  if (!eventData.location || !eventData.description || !eventData.rating)
    throw new MissingBookDataError();

  const hash = crypto
    .createHash("sha256")
    .update(`${eventData.book_id}-${eventData.user_id}-${Date.now()}`)
    .digest("hex");

  const event = await eventDao.createEvent({ ...eventData, hash });

  const images = await Promise.all(
    files.map((file) =>
      eventDao.createEventImage(event.id, `/uploads/events/${file.filename}`),
    ),
  );

  return { ...event, images };
}
