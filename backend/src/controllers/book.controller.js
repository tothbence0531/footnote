import { selectBooks } from "../daos/book.dao.js";
import {
  getOwnedBooksByUserId,
  getReadBooksByUserId,
} from "../services/book.service.js";

export const getBooks = async (req, res, next) => {
  try {
    const books = await selectBooks();
    res.status(200).json(books);
  } catch (error) {
    next(error);
  }
};

export const getOwnedUserBooks = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const ownedBooks = await getOwnedBooksByUserId(userId);
    res.status(200).json(ownedBooks);
  } catch (error) {
    next(error);
  }
};

export const getReadUserBooks = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const readBooks = await getReadBooksByUserId(userId);
    res.status(200).json(readBooks);
  } catch (error) {
    next(error);
  }
};

export const getAllUserBooks = async (req, res, next) => {
  try {
    console.log("getallbookscalled");
    console.log(req.user);
    const userId = req.user.userId;
    const ownedBooks = await getOwnedBooksByUserId(userId);
    const readBooks = await getReadBooksByUserId(userId);
    res.status(200).json({ ownedBooks, readBooks });
  } catch (error) {
    next(error);
  }
};
