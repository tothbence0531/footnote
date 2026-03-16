import db from "../config/db.js";

export const selectBooks = async () => {
  const query = "SELECT * FROM books";
  const result = await db.query(query);
  return result.rows;
};

export const selectBookById = async (id) => {
  const result = await db.query("SELECT * FROM books WHERE id = $1", [id]);
  return result.rows[0] ?? null;
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
     WHERE be.user_id = $1
     AND b.original_owner != $1
     `,
    [id],
  );
  return result.rows;
};

export const createBook = async (book) => {
  const query =
    "INSERT INTO books (title, author, cover_image_url, original_owner) VALUES ($1, $2, $3, $4) RETURNING *";
  const result = await db.query(query, [
    book.title,
    book.author,
    book.cover_image_url,
    book.original_owner,
  ]);
  return result.rows[0];
};

export const selectBookWithEventsById = async (id) => {
  const result = await db.query(
    `SELECT 
      b.id, b.title, b.author, b.cover_image_url, b.created_at,
      b.original_owner,
      u.username AS owner_name,
      json_agg(
        json_build_object(
          'id', be.id,
          'user_id', be.user_id,
          'user_name', eu.username,
          'location', be.location,
          'description', be.description,
          'rating', be.rating,
          'hash', be.hash,
          'created_at', be.created_at,
          'images', (
            SELECT json_agg(json_build_object('id', ei.id, 'image_url', ei.image_url))
            FROM event_images ei
            WHERE ei.event_id = be.id
          )
        ) ORDER BY be.created_at ASC
      ) FILTER (WHERE be.id IS NOT NULL) AS events
    FROM books b
    LEFT JOIN users u ON u.id = b.original_owner
    LEFT JOIN book_events be ON be.book_id = b.id
    LEFT JOIN users eu ON eu.id = be.user_id
    WHERE b.id = $1
    GROUP BY b.id, u.username
    `,
    [id],
  );
  return result.rows[0] ?? null;
};

export const deleteBookById = async (id) => {
  const result = await db.query("DELETE FROM books WHERE id = $1", [id]);
  return result.rowCount;
};

export const updateBookChainTx = async (id, txHash) => {
  await db.query("UPDATE books SET chain_tx_hash = $1 WHERE id = $2", [
    txHash,
    id,
  ]);
};
