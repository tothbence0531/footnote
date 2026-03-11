import {
  getOwnedBooksByUserId,
  getReadBooksByUserId,
  addBook,
  getBookWithEventsById,
  deleteBookById,
} from "../services/book.service.js";

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
    const userId = req.user.userId;
    const ownedBooks = await getOwnedBooksByUserId(userId);
    const readBooks = await getReadBooksByUserId(userId);
    res.status(200).json({ ownedBooks, readBooks });
  } catch (error) {
    next(error);
  }
};

export const addOwnedBook = async (req, res, next) => {
  try {
    const book = req.body;
    const addedBook = await addBook(book);
    res.status(200).json(addedBook);
  } catch (error) {
    next(error);
  }
};

export const uploadCoverImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filename = req.file.filename;
    const coverUrl = `/uploads/covers/${filename}`;

    res.status(200).json({ filename, coverUrl });
  } catch (error) {
    next(error);
  }
};

export const getBookWithEvents = async (req, res, next) => {
  try {
    const { id } = req.params;
    const book = await getBookWithEventsById(id);
    res.status(200).json(book);
  } catch (error) {
    next(error);
  }
};

export const deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedBooks = await deleteBookById(id, req.user.userId);
    res.status(200).json(deletedBooks);
  } catch (error) {
    next(error);
  }
};
