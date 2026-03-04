import * as userDao from "../daos/user.dao.js";
import * as booksDao from "../daos/book.dao.js";
import { UserNotFoundError } from "../utils/authErrors.js";

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
