const { Pool } = require("pg");

// PostgreSQL connection (Docker service name = db)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;