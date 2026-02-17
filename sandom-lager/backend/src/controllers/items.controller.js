const pool = require("../db/pool");

// GET all items from database
async function getItems(req, res) {
  try {
    const result = await pool.query("SELECT * FROM items ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
}

module.exports = { getItems };