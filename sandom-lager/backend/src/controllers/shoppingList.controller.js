const pool = require('../db/pool');
const ApiError = require('../utils/ApiError');

// GET /api/shopping-list - Get shopping list items for user's approved location
async function getShoppingList(req, res) {
    const userId = req.user.id;

    // Get user's approved location access
    const userLocationResult = await pool.query(
        `SELECT location_id FROM user_locations 
         WHERE user_id = $1 AND access_status = 'approved'
         LIMIT 1`,
        [userId]
    );

    if (userLocationResult.rows.length === 0) {
        throw new ApiError(403, "No approved location access");
    }

    const locationId = userLocationResult.rows[0].location_id;

    // Get shopping list items for that location
    const result = await pool.query(
        `SELECT 
            sl.id,
            sl.needed_quantity,
            i.name AS ingredient,
            i.unit,
            l.name AS location,
            i.id AS ingredient_id,
            l.id AS location_id
        FROM shopping_list sl
        JOIN ingredients i ON sl.ingredient_id = i.id
        JOIN locations l ON sl.location_id = l.id
        WHERE sl.location_id = $1
        ORDER BY sl.created_at DESC`,
        [locationId]
    );

    res.json(result.rows);
}

// POST /api/shopping-list - Add a new item to the shopping list
async function createShoppingListItem(req, res) {
    const userId = req.user.id;
    const { ingredient_id, needed_quantity } = req.body;

    // Validate required fields
    if (!ingredient_id || needed_quantity === undefined) {
        throw new ApiError(400, "Missing required fields: ingredient_id, needed_quantity");
    }

    // Get user's approved location (location_id is determined by backend, not client)
    const userLocationResult = await pool.query(
        `SELECT location_id FROM user_locations 
         WHERE user_id = $1 AND access_status = 'approved'
         LIMIT 1`,
        [userId]
    );

    if (userLocationResult.rows.length === 0) {
        throw new ApiError(403, "No approved location access");
    }

    const location_id = userLocationResult.rows[0].location_id;

    // Validate that ingredient exists
    const ingredientCheck = await pool.query(
        "SELECT id FROM ingredients WHERE id = $1",
        [ingredient_id]
    );

    if (ingredientCheck.rows.length === 0) {
        throw new ApiError(400, "Invalid ingredient_id");
    }

    // Check if item already exists in shopping list for this location
    const existingItem = await pool.query(
        `SELECT id, needed_quantity FROM shopping_list 
         WHERE ingredient_id = $1 AND location_id = $2`,
        [ingredient_id, location_id]
    );

    if (existingItem.rows.length > 0) {
        // Update existing item instead of creating duplicate
        const result = await pool.query(
            `UPDATE shopping_list 
             SET needed_quantity = needed_quantity + $1, updated_at = NOW()
             WHERE ingredient_id = $2 AND location_id = $3 
             RETURNING *`,
            [needed_quantity, ingredient_id, location_id]
        );
        res.status(200).json(result.rows[0]);
    } else {
        // Create new item
        const result = await pool.query(
            "INSERT INTO shopping_list (ingredient_id, location_id, needed_quantity) VALUES ($1, $2, $3) RETURNING *",
            [ingredient_id, location_id, needed_quantity]
        );
        res.status(201).json(result.rows[0]);
    }
}

// PUT /api/shopping-list/:id - Update an existing shopping list item
async function updateShoppingListItem(req, res) {
    const userId = req.user.id;
    const { id } = req.params;
    const { needed_quantity } = req.body;

    // Get user's approved location
    const userLocationResult = await pool.query(
        `SELECT location_id FROM user_locations 
         WHERE user_id = $1 AND access_status = 'approved'
         LIMIT 1`,
        [userId]
    );

    if (userLocationResult.rows.length === 0) {
        throw new ApiError(403, "No approved location access");
    }

    const locationId = userLocationResult.rows[0].location_id;

    // Only allow updating items in user's location
    const result = await pool.query(
        `UPDATE shopping_list 
         SET needed_quantity = $1, updated_at = NOW()
         WHERE id = $2 AND location_id = $3 
         RETURNING *`,
        [needed_quantity, id, locationId]
    );

    if (result.rows.length === 0) {
        throw new ApiError(404, "Shopping list item not found or access denied");
    }

    res.json(result.rows[0]);
}

// DELETE /api/shopping-list/:id - Delete a shopping list item
async function deleteShoppingListItem(req, res) {
    const userId = req.user.id;
    const { id } = req.params;

    // Get user's approved location
    const userLocationResult = await pool.query(
        `SELECT location_id FROM user_locations 
         WHERE user_id = $1 AND access_status = 'approved'
         LIMIT 1`,
        [userId]
    );

    if (userLocationResult.rows.length === 0) {
        throw new ApiError(403, "No approved location access");
    }

    const locationId = userLocationResult.rows[0].location_id;

    // Only allow deleting items from user's location
    const result = await pool.query(
        `DELETE FROM shopping_list 
         WHERE id = $1 AND location_id = $2 
         RETURNING *`,
        [id, locationId]
    );

    if (result.rows.length === 0) {
        throw new ApiError(404, "Shopping list item not found or access denied");
    }

    res.json({ message: "Shopping list item deleted successfully", deleted: result.rows[0] });
}

module.exports = {
    getShoppingList,
    createShoppingListItem,
    updateShoppingListItem,
    deleteShoppingListItem
};