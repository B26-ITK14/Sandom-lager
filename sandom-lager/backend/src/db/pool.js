const { Pool } = require("pg");

// PostgreSQL connection (Docker service name = db)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

let userSchemaPromise = null;

function ensureUserSchema() {
  if (!userSchemaPromise) {
    userSchemaPromise = pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        auth0_id TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        name TEXT,
        role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'manager')),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS user_sessions (
        id TEXT PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        last_seen_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL CHECK (type IN ('warning', 'info', 'alert')),
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        location_nickname TEXT,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS notifications_user_created_idx
      ON notifications (user_id, created_at DESC);

      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS profile_picture TEXT;

      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS username TEXT;

      CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique_idx
      ON users (LOWER(username))
      WHERE username IS NOT NULL;

      CREATE TABLE IF NOT EXISTS revoked_sessions (
        id TEXT PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        revoked_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `).catch((error) => {
      userSchemaPromise = null;
      throw error;
    });
  }

  return userSchemaPromise;
}

module.exports = pool;
module.exports.ensureUserSchema = ensureUserSchema;