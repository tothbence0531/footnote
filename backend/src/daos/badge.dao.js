import db from "../config/db.js";

export const getUserStats = async (userId) => {
  const result = await db.query(
    `SELECT
      COUNT(be.id) AS total_events,
      COUNT(DISTINCT be.book_id) AS distinct_books,
      COUNT(DISTINCT be.location) AS distinct_locations,
      COUNT(CASE WHEN be.rating > 0 THEN 1 END) AS total_ratings,
      COUNT(CASE WHEN be.created_at > NOW() - INTERVAL '7 days' THEN 1 END) AS events_this_week,
      (SELECT COUNT(*) FROM books WHERE original_owner = $1) AS owned_books
    FROM book_events be
    WHERE be.user_id = $1`,
    [userId],
  );

  const row = result.rows[0];
  return {
    total_events: parseInt(row.total_events),
    distinct_books: parseInt(row.distinct_books),
    distinct_locations: parseInt(row.distinct_locations),
    total_ratings: parseInt(row.total_ratings),
    events_this_week: parseInt(row.events_this_week),
    owned_books: parseInt(row.owned_books),
  };
};

export const getUserBadgeIds = async (userId) => {
  const result = await db.query(
    "SELECT badge_id FROM user_badges WHERE user_id = $1",
    [userId],
  );
  return result.rows.map((r) => r.badge_id);
};

export const insertUserBadge = async (userId, badgeId) => {
  await db.query(
    `INSERT INTO user_badges (user_id, badge_id) 
     VALUES ($1, $2) 
     ON CONFLICT DO NOTHING`,
    [userId, badgeId],
  );
};

export const updateUserBadgeChainTx = async (userId, badgeId, txHash) => {
  await db.query(
    `UPDATE user_badges SET chain_tx_hash = $1 
     WHERE user_id = $2 AND badge_id = $3`,
    [txHash, userId, badgeId],
  );
};

export const getUserBadges = async (userId) => {
  const result = await db.query(
    `SELECT b.id, b.name, b.image_url, ub.obtained_at, ub.chain_tx_hash
     FROM user_badges ub
     JOIN badges b ON b.id = ub.badge_id
     WHERE ub.user_id = $1
     ORDER BY ub.obtained_at ASC`,
    [userId],
  );
  return result.rows;
};

export const selectAllBadges = async () => {
  const result = await db.query(`SELECT * FROM badges ORDER BY id ASC`);
  return result.rows;
};
