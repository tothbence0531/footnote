import db from "../config/db.js";

export const createEvent = async (event) => {
  const result = await db.query(
    `INSERT INTO book_events (book_id, user_id, location, description, rating, hash)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      event.book_id,
      event.user_id,
      event.location,
      event.description,
      event.rating,
      event.hash,
    ],
  );
  return result.rows[0];
};

export const createEventImage = async (eventId, imageUrl) => {
  const result = await db.query(
    `INSERT INTO event_images (event_id, image_url) VALUES ($1, $2) RETURNING *`,
    [eventId, imageUrl],
  );
  return result.rows[0];
};
