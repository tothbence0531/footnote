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

export async function addEvent(eventData, files) {
  console.log("=== EVENT DEBUG ===");
  console.log("book_id:", eventData.book_id);
  console.log("user_id:", eventData.user_id);
  console.log("description:", eventData.description);
  console.log("location:", eventData.location);
  console.log("rating:", eventData.rating);
  console.log("created_at:", eventData.created_at);
  console.log("wallet_address:", eventData.wallet_address);
  console.log("signature:", eventData.signature);

  const h_createdAt = eventData.created_at ?? new Date().toISOString();

  const hashInput = `${eventData.book_id}::${eventData.user_id}::${eventData.description}::${eventData.location}::${eventData.rating}::${h_createdAt}`;
  console.log("hashInput:", hashInput);

  const h_hash = crypto.createHash("sha256").update(hashInput).digest("hex");
  console.log("computed hash:", h_hash);
  console.log("==================");

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

  const bookAge = Date.now() - new Date(bookExists.created_at).getTime();
  if (bookAge < 5000) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  console.log("Waiting for book registration...");
  const isRegistered = await waitForBookRegistration(eventData.book_id);
  console.log("Book registered on chain:", isRegistered);
  if (!isRegistered) {
    console.error(
      `Book ${eventData.book_id} not registered on chain, skipping event log`,
    );
  } else {
    try {
      const txHash = await logEventOnChain(
        eventData.book_id,
        hash,
        eventData.wallet_address ?? null,
        eventData.signature ?? null,
      );
      await eventDao.updateEventChainTx(event.id, txHash);
      console.log(`Event ${event.id} logged on chain: ${txHash}`);
    } catch (err) {
      console.error(`Chain log failed for event ${event.id}:`, err);
    }
  }

  return { ...event, images };
}
