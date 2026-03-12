const pool = require('../db/pool');
const ApiError = require('../utils/ApiError');

// GET /api/shopping-list - Get all shopping list items
async function getShoppingList(req, res) {
    try {
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

    } catch (err) {
        console.error("getShoppingList error:", err);
        res.status(500).json({ message: "Failed to fetch shopping list" });
    }
}

// POST /api/shopping-list - Add a new item to the shopping list
async function createShoppingListItem(req, res) {
    try {
        const { ingredient_id, location_id, needed_quantity } = req.body;

        // Validate required fields
        if (!ingredient_id || !location_id || needed_quantity === undefined) {
            return res.status(400).json({ message: "Missing required fields: ingredient_id, location_id, needed_quantity" });
        }

        const result = await pool.query(
            "INSERT INTO shopping_list (ingredient_id, location_id, needed_quantity) VALUES ($1, $2, $3) RETURNING *",
            [ingredient_id, location_id, needed_quantity]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("createShoppingListItem error:", err);
        res.status(500).json({ message: "Failed to create shopping list item" });
    }
}

// PUT /api/shopping-list/:id - Update an existing shopping list item
async function updateShoppingListItem(req, res) {
    try {
        const { id } = req.params;
        const { needed_quantity } = req.body;

        const result = await pool.query(
            "UPDATE shopping_list SET needed_quantity = $1 WHERE id = $2 RETURNING *",
            [needed_quantity, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Shopping list item not found" });
        }   

        res.json(result.rows[0]);
    } catch (err) {
        console.error("updateShoppingListItem error:", err);
        res.status(500).json({ message: "Failed to update shopping list item" });
    }
}

// DELETE /api/shopping-list/:id - Delete a shopping list item
async function deleteShoppingListItem(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM shopping_list WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Shopping list item not found," });
        }

        res.json({ message: "Shopping list item deleted successfully", deleted: result.rows[0]   });

    } catch (err) {
        console.error("deleteShoppingListItem error:", err);
        res.status(500).json({ message: "Failed to delete shopping list item" });
    }
}

module.exports = {
    getShoppingList,
    createShoppingListItem,
    updateShoppingListItem,
    deleteShoppingListItem
};