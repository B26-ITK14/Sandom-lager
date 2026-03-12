const pool = require("../db/pool");
const ApiError = require("../utils/ApiError");
const { logAction } = require("../utils/logger");

// GET api/inventory - Get all inventory items
async function getInventory(req, res) {
    
    const result = await pool.query(
        `SELECT 
        inv.id,
        inv.quantity,
        i.name AS ingredient,
        i.unit,
        l.name AS location
        FROM inventory inv
        JOIN ingredients i ON inv.ingredient_id = i.id
        JOIN locations l ON inv.location_id = l.id
        ORDER BY inv.id DESC`
        );

        res.json(result.rows);
}

// POST api/inventory
async function createInventory(req, res) {
    
    const { ingredient_id, location_id, quantity } = req.body;

    if (!ingredient_id || !location_id || quantity === undefined) {
        throw new ApiError(400, "Missing required fields: ingredient_id, location_id, quantity");
    }

        const result = await pool.query(
            `INSERT INTO inventory (ingredient_id, location_id, quantity) 
             VALUES ($1, $2, $3) 
             RETURNING *`,
            [ingredient_id, location_id, quantity]
        );

        const ingredientResult = await pool.query(
            `SELECT name FROM ingredients WHERE id = $1`,
            [ingredient_id]
        );

        const ingredientName =
            ingredientResult.rows[0]?.name || ingredient_id;

        await logAction(
            req.user,
            `La til inventar: ${ingredientName} (${quantity})`
        );

        res.status(201).json(result.rows[0]);

}

// PUT api/inventory/:id
async function updateInventory(req, res) {
    
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
        throw new ApiError(400, "Missing required field: quantity");
    }

    const result = await pool.query(
        `UPDATE inventory inv
         SET quantity = $1
         FROM ingredients i
         WHERE inv.id = $2
         AND inv.ingredient_id = i.id
         RETURNING inv.id, inv.quantity, i.name`,
        [quantity, id]
    );

    if (result.rows.length === 0) {
        throw new ApiError(404, "Inventory item not found");
    }

    const item = result.rows[0];

    await logAction(
        req.user,
        `Oppdaterte inventar: ${item.name} → ny mengde ${item.quantity}`
    );

    res.json(item);
}

// DELETE api/inventory/:id
async function deleteInventory(req, res) {

    const { id } = req.params;

    const result = await pool.query(
        `DELETE FROM inventory WHERE id = $1 RETURNING *`,
        [id]
    );

    if (result.rows.length === 0) {
        throw new ApiError(404, "Inventory item not found");
    }

    const deleted = result.rows[0];

    const ingredientResult = await pool.query(
        `SELECT name FROM ingredients WHERE id = $1`,
        [deleted.ingredient_id]
    );

    const ingredientName =
        ingredientResult.rows[0]?.name || deleted.ingredient_id;

    await logAction(
        req.user,
        `Slettet inventar: ${ingredientName}`
    );

    res.json({
        message: "Inventory item deleted",
        deleted
    });
}

module.exports = {
    getInventory,
    createInventory,
    updateInventory,
    deleteInventory
};