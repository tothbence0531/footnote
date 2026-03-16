import * as userDao from "../daos/user.dao.js";
import * as booksDao from "../daos/book.dao.js";
import { UserNotFoundError } from "../utils/authErrors.js";
import {
  MissingBookDataError,
  BookNotFoundError,
  InvalidBookIdError,
  NotOwnerError,
} from "../utils/bookErrors.js";
import { logActivity, ACTIVITY_TYPES } from "./activity.service.js";
import { registerBookOnChain } from "./blockchain.service.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getOwnedBooksByUserId(userId) {
  const userExists = await userDao.selectUserById(userId);
  if (!userExists) throw new UserNotFoundError();

  const ownedBooks = await booksDao.selectOwnedBooksByUserId(userId);
  return ownedBooks;
}

export async function getReadBooksByUserId(userId) {
  const userExists = await userDao.selectUserById(userId);
  if (!userExists) throw new UserNotFoundError();

  const readBooks = await booksDao.selectReadBooksByUserId(userId);
  return readBooks;
}

export async function addBook(book) {
  const userExists = await userDao.selectUserById(book.original_owner);
  if (!userExists) throw new UserNotFoundError();

  if (!book.title || !book.author || !book.cover_image_url)
    throw new MissingBookDataError();

  const addedBook = await booksDao.createBook(book);

  await logActivity({
    user_id: addedBook.original_owner,
    type: ACTIVITY_TYPES.BOOK_ADDED,
    entity_id: addedBook.id,
  });

  try {
    const txHash = await registerBookOnChain(
      addedBook.id,
      addedBook.title,
      addedBook.author,
    );
    await booksDao.updateBookChainTx(addedBook.id, txHash);
    console.log(`Book ${addedBook.id} registered on chain: ${txHash}`);

    await new Promise((resolve) => setTimeout(resolve, 500));
  } catch (err) {
    console.error(`Chain registration failed for book ${addedBook.id}:`, err);
  }

  return addedBook;
}

export async function getBookWithEventsById(bookId) {
  if (!bookId) throw new MissingBookDataError();
  if (!UUID_REGEX.test(bookId)) throw new InvalidBookIdError();

  const book = await booksDao.selectBookWithEventsById(bookId);
  if (!book) throw new BookNotFoundError();
  return book;
}

export async function deleteBookById(bookId, userId) {
  if (!bookId) throw new MissingBookDataError();
  if (!UUID_REGEX.test(bookId)) throw new InvalidBookIdError();

  const bookExists = await booksDao.selectBookById(bookId);
  if (!bookExists) throw new BookNotFoundError();

  if (bookExists.original_owner !== userId) throw new NotOwnerError();

  const deletedBooks = await booksDao.deleteBookById(bookId);
  return deletedBooks;
}
