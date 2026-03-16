import crypto from "crypto";
import * as eventDao from "../daos/event.dao.js";
import * as userDao from "../daos/user.dao.js";
import * as booksDao from "../daos/book.dao.js";
import { UserNotFoundError } from "../utils/authErrors.js";
import {
  BookNotFoundError,
  MissingBookDataError,
} from "../utils/bookErrors.js";
import { logActivity, ACTIVITY_TYPES } from "./activity.service.js";
import { logEventOnChain } from "./blockchain.service.js";

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

  await logActivity({
    user_id: event.user_id,
    type: ACTIVITY_TYPES.EVENT_ADDED,
    entity_id: event.id.toString(),
  });

  logEventOnChain(eventData.book_id, hash, eventData.wallet_address ?? null)
    .then(async (txHash) => {
      await eventDao.updateEventChainTx(event.id, txHash);
      console.log(`Event ${event.id} logged on chain: ${txHash}`);
    })
    .catch((err) => {
      console.error(`Chain log failed for event ${event.id}:`, err);
    });

  return { ...event, images };
}
