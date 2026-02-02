import app from "./app.js";
import db from "./config/db.js";

async function startServer() {
  try {
    await db.query("SELECT NOW()");
    console.log("Database connected");
  } catch (error) {
    console.error("Database connection error: ", error?.message || error);
  }
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

startServer();
