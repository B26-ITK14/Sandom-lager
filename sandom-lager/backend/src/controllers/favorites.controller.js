/*
    * favorites.controller.js
    * Controller for managing user favorites (inventory items).
    * Author: Ida Tollaksen
*/
const pool = require("../db/pool");
const ApiError = require("../utils/ApiError");

// GET /api/user/favorites
async function getUserFavorites(req, res) {
    const userId = req.user.id;

    res.set("Cache-Control", "no-store");

    const result = await pool.query(
        `SELECT inventory_id FROM user_favorites WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
    );

    // Return array of inventory ids
    res.json(result.rows.map((r) => Number(r.inventory_id)));
}

// POST /api/user/favorites/:inventoryId
async function addFavorite(req, res) {
    const userId = req.user.id;
    const inventoryId = Number(req.params.inventoryId);

    if (!Number.isFinite(inventoryId)) {
        throw new ApiError(400, "Invalid inventory id");
    }

    // Ensure user has an approved location
    const locRes = await pool.query(
        `SELECT location_id FROM user_locations WHERE user_id = $1 AND access_status = 'approved' LIMIT 1`,
        [userId]
    );

    if (locRes.rows.length === 0) {
        throw new ApiError(403, "No approved location found for user");
    }

    // Ensure inventory exists and belongs to the user's location
    const invRes = await pool.query(
        `SELECT id, location_id FROM inventory WHERE id = $1`,
        [inventoryId]
    );

    if (invRes.rows.length === 0) {
        throw new ApiError(404, "Inventory item not found");
    }

    const inventory = invRes.rows[0];
    const userLocationId = locRes.rows[0].location_id;

    if (inventory.location_id !== userLocationId) {
        throw new ApiError(403, "Inventory item is not accessible for the current user location");
    }

    const result = await pool.query(
        `INSERT INTO user_favorites (user_id, inventory_id) VALUES ($1, $2) ON CONFLICT (user_id, inventory_id) DO NOTHING RETURNING inventory_id`,
        [userId, inventoryId]
    );

    if (result.rows.length === 0) {
        // Already existed
        return res.status(200).json({ inventory_id: inventoryId, message: "Already favorited" });
    }

    res.status(201).json({ inventory_id: Number(result.rows[0].inventory_id) });
}

// DELETE /api/user/favorites/:inventoryId
async function removeFavorite(req, res) {
    const userId = req.user.id;
    const inventoryId = Number(req.params.inventoryId);

    if (!Number.isFinite(inventoryId)) {
        throw new ApiError(400, "Invalid inventory id");
    }

    const result = await pool.query(
        `DELETE FROM user_favorites WHERE user_id = $1 AND inventory_id = $2 RETURNING inventory_id`,
        [userId, inventoryId]
    );

    if (result.rows.length === 0) {
        throw new ApiError(404, "Favorite not found");
    }

    res.json({ inventory_id: Number(result.rows[0].inventory_id) });
}

module.exports = {
    getUserFavorites,
    addFavorite,
    removeFavorite,
};
