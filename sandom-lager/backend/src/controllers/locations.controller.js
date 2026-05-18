/*
    * locations.controller.js
    * Controller for location CRUD and access management.
    * Author: Khalid Osman 
*/
const pool = require("../db/pool");
const ApiError = require("../utils/ApiError");

// GET /api/locations - Henter alle lokasjoner
async function getAllLocations(req, res) {
    const result = await pool.query("SELECT id, name FROM locations ORDER BY id ASC");
    res.json(result.rows);
}

module.exports = { getAllLocations };