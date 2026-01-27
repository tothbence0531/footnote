import db from "../config/db.js";

export const selectBooks = async () => {
  const query = "SELECT * FROM books";
  const result = await db.query(query);
  return result.rows;
};
