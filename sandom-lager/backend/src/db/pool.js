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

      CREATE TABLE IF NOT EXISTS user_sessions (
        id TEXT PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        last_seen_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `).catch((error) => {
      userSchemaPromise = null;
      throw error;
    });
  }

  return userSchemaPromise;
}

module.exports = pool;
module.exports.ensureUserSchema = ensureUserSchema;