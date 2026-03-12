const pool = require('../db/pool');
const ApiError = require('../utils/ApiError');

// GET /api/shopping-list - Get all shopping list items
async function getShoppingList(req, res) {

    const result = await pool.query(
        `SELECT 
            sl.id,
            sl.needed_quantity,
            i.name AS ingredient,
            i.unit,
            l.name AS location
        FROM shopping_list sl
        JOIN ingredients i ON sl.ingredient_id = i.id
        JOIN locations l ON sl.location_id = l.id
        ORDER BY sl.id DESC`
    );

    res.json(result.rows);
}

// POST /api/shopping-list - Add a new item to the shopping list
async function createShoppingListItem(req, res) {
    
    const { ingredient_id, location_id, needed_quantity } = req.body;

    // Validate required fields
    if (!ingredient_id || !location_id || needed_quantity === undefined) {
        throw new ApiError(400, "Missing required fields: ingredient_id, location_id, needed_quantity");
    }

    const result = await pool.query(
        "INSERT INTO shopping_list (ingredient_id, location_id, needed_quantity) VALUES ($1, $2, $3) RETURNING *",
        [ingredient_id, location_id, needed_quantity]
    );

    res.status(201).json(result.rows[0]);
}

// PUT /api/shopping-list/:id - Update an existing shopping list item
async function updateShoppingListItem(req, res) {

    const { id } = req.params;
    const { needed_quantity } = req.body;

    const result = await pool.query(
        "UPDATE shopping_list SET needed_quantity = $1 WHERE id = $2 RETURNING *",
        [needed_quantity, id]
    );

    if (result.rows.length === 0) {
        throw new ApiError(404, "Shopping list item not found");
    }

    res.json(result.rows[0]);
}

// DELETE /api/shopping-list/:id - Delete a shopping list item
async function deleteShoppingListItem(req, res) {
    
    const { id } = req.params;

    const result = await pool.query(
        "DELETE FROM shopping_list WHERE id = $1 RETURNING *",
        [id]
    );

    if (result.rows.length === 0) {
        throw new ApiError(404, "Shopping list item not found");
    }

    res.json({ message: "Shopping list item deleted successfully", deleted: result.rows[0]   });
}

module.exports = {
    getShoppingList,
    createShoppingListItem,
    updateShoppingListItem,
    deleteShoppingListItem
};