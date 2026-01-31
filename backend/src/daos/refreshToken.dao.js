import db from "../config/db.js";

export async function insertRefreshToken(userId, token, expiresAt) {
  await db.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, token, expiresAt],
  );
}

export async function selectRefreshToken(token) {
  const res = await db.query(
    `SELECT * FROM refresh_tokens
     WHERE token = $1 AND expires_at > now()`,
    [token],
  );
  return res.rows[0];
}

export async function deleteRefreshToken(token) {
  return await db.query(`DELETE FROM refresh_tokens WHERE token = $1`, [token]);
}
