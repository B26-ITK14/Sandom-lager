const { Pool } = require("pg");

// PostgreSQL connection (Docker service name = db)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

let userSchemaPromise = null;

function ensureUserSchema() {
  if (!userSchemaPromise) {
    userSchemaPromise = pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS profile_picture TEXT;

      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS username TEXT;

      CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique_idx
      ON users (LOWER(username))
      WHERE username IS NOT NULL
    `).catch((error) => {
      userSchemaPromise = null;
      throw error;
    });
  }

  return userSchemaPromise;
}

module.exports = pool;
module.exports.ensureUserSchema = ensureUserSchema;