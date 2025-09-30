// backend/db.js
const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
});

// ✅ Test connection at startup
pool.connect()
  .then((client) => {
    console.log("✅ Connected to Postgres");
    client.release(); // release the client back to the pool
  })
  .catch((err) => {
    console.error("❌ Failed to connect to Postgres:", err.message);
  });

module.exports = pool;