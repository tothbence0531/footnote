import db from "../config/db.js";

export const insertUser = async (email, username, password_hash) => {
  const query =
    "INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING *";
  const result = await db.query(query, [email, username, password_hash]);
  return result.rows;
};

export async function selectUserByEmail(email) {
  const res = await db.query(
    "SELECT id, email, password_hash FROM users WHERE email = $1",
    [email],
  );
  return res.rows[0];
}

export async function selectUserByUsername(username) {
  const res = await db.query(
    "SELECT id, email, password_hash FROM users WHERE username = $1",
    [username],
  );
  return res.rows[0];
}
