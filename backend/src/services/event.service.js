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
import {
  logEventOnChain,
  waitForBookRegistration,
} from "./blockchain.service.js";
import { checkEventBadges } from "./badge.service.js";

export async function addEvent(eventData, files) {
  const userExists = await userDao.selectUserById(eventData.user_id);
  if (!userExists) throw new UserNotFoundError();

  const bookExists = await booksDao.selectBookById(eventData.book_id);
  if (!bookExists) throw new BookNotFoundError();

  if (!eventData.location || !eventData.description || !eventData.rating)
    throw new MissingBookDataError();

  const createdAt = eventData.created_at ?? new Date().toISOString();

  const hash = crypto
    .createHash("sha256")
    .update(
      `${eventData.book_id}::${eventData.user_id}::${eventData.description}::${eventData.location}::${eventData.rating}::${createdAt}`,
    )
    .digest("hex");

  const event = await eventDao.createEvent({
    ...eventData,
    hash,
    created_at: createdAt,
  });

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

  setImmediate(async () => {
    const isRegistered = await waitForBookRegistration(eventData.book_id);
    if (!isRegistered) return;

    try {
      const txHash = await logEventOnChain(
        eventData.book_id,
        hash,
        eventData.wallet_address ?? null,
        eventData.signature ?? null,
      );
      await eventDao.updateEventChainTx(event.id, txHash);
      console.log(`Event ${event.id} logged on chain: ${txHash}`);

      await checkEventBadges(eventData.user_id);
    } catch (err) {
      console.error(`Chain log failed for event ${event.id}:`, err);
    }
  });

  return { ...event, images };
}
