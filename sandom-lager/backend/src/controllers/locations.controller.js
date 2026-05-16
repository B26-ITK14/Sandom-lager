/*
    * locations.controller.js
    * Controller for location CRUD and access management.
    * Author: Khalid Osman 
*/
const pool = require("../db/pool");

// GET /api/locations - Henter alle lokasjoner
async function getAllLocations(req, res) {
    try {
        const result = await pool.query("SELECT id, name FROM locations ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        console.error("getAllLocations error:", err);
        res.status(500).json({ message: "Failed to fetch locations" });
    }
}

module.exports = { getAllLocations };