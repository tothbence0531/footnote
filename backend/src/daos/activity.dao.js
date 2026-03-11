import db from "../config/db.js";

export const createActivity = async ({ user_id, type, entity_id }) => {
  const result = await db.query(
    `INSERT INTO activity_feed (user_id, type, entity_id)
     VALUES ($1, $2, $3) RETURNING *`,
    [user_id, type, entity_id],
  );
  return result.rows[0];
};

export const selectActivityFeed = async (limit = 50) => {
  const result = await db.query(
    `SELECT 
      af.id, af.type, af.entity_id, af.created_at,
      u.username, u.id AS user_id,
      
      CASE WHEN af.type = 'book_added' THEN
        json_build_object(
          'id', b.id,
          'title', b.title,
          'author', b.author,
          'cover_image_url', b.cover_image_url
        )
      END AS book,

     CASE WHEN af.type = 'event_added' THEN
  json_build_object(
    'id', be.id,
    'location', be.location,
    'description', be.description,
    'rating', be.rating,
    'book_id', be.book_id,
    'book_title', eb.title,
    'book_cover', eb.cover_image_url,
    'images', (
      SELECT json_agg(json_build_object('id', ei.id, 'image_url', ei.image_url))
      FROM event_images ei
      WHERE ei.event_id = be.id
    )
  )
END AS event

     FROM activity_feed af
     JOIN users u ON u.id = af.user_id
     LEFT JOIN books b ON af.type = 'book_added' AND b.id::text = af.entity_id
     LEFT JOIN book_events be ON af.type = 'event_added' AND be.id::text = af.entity_id
     LEFT JOIN books eb ON eb.id = be.book_id
     ORDER BY af.created_at DESC
     LIMIT $1`,
    [limit],
  );
  return result.rows;
};

export const selectActivityFeedByUserId = async (userId, limit = 50) => {
  const result = await db.query(
    `SELECT 
      af.id, af.type, af.entity_id, af.created_at,
      u.username, u.id AS user_id
     FROM activity_feed af
     JOIN users u ON u.id = af.user_id
     WHERE af.user_id = $1
     ORDER BY af.created_at DESC
     LIMIT $2`,
    [userId, limit],
  );
  return result.rows;
};
