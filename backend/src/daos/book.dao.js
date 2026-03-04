import db from "../config/db.js";

export const selectBooks = async () => {
  const query = "SELECT * FROM books";
  const result = await db.query(query);
  return result.rows;
};

export const selectOwnedBooksByUserId = async (id) => {
  const result = await db.query(
    "SELECT * FROM books WHERE original_owner = $1",
    [id],
  );
  return result.rows;
};

export const selectReadBooksByUserId = async (id) => {
  const result = await db.query(
    `SELECT DISTINCT b.*
     FROM books b
     JOIN book_events be ON be.book_id = b.id
     WHERE be.user_id = $1`,
    [id],
  );
  return result.rows;
};
