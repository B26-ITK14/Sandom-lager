const express = require("express");
const { Pool } = require("pg");
const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());

// PostgreSQL connection (Docker service name = db)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test route
app.get("/", (req, res) => {
  res.send("Backend kjører og er koblet til PostgreSQL!");
});

// GET all items from database
app.get("/items", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM items ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.listen(PORT, () => {
  console.log("Backend startet på port " + PORT);
});

