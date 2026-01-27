import pkg from "pg";
const { Pool } = pkg;

import dotenv from "dotenv";
dotenv.config();

// console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
// console.log("DB_USER:", process.env.DB_USER);
// console.log("DB_HOST:", process.env.DB_HOST);
// console.log("DB_NAME:", process.env.DB_NAME);
// console.log("DB_PORT:", Number(process.env.PORT));

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

export default pool;
