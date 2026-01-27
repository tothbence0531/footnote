import { selectBooks } from "../daos/book.dao.js";

export const getBooks = async (req, res) => {
  const books = await selectBooks();
  res.status(200).json(books);
};
