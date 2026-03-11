const pool = require("../db/pool");
const { logAction } = require("../utils/logger");

// GET api/inventory - Get all inventory items
async function getInventory(req, res) {
    try {
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

    } catch (err) {
        console.error("getInventory error:", err);
        res.status(500).json({ message: "Failed to fetch inventory" });
    }
}

// POST api/inventory
async function createInventory(req, res) {
    try {
        const { ingredient_id, location_id, quantity } = req.body;

        if (!ingredient_id || !location_id || quantity === undefined) {
            return res.status(400).json({
                message: "Missing required fields: ingredient_id, location_id, quantity"
            });
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

    } catch (err) {
        console.error("createInventory error:", err);
        res.status(500).json({ message: "Failed to create inventory item" });
    }
}

// PUT api/inventory/:id
async function updateInventory(req, res) {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        if (quantity === undefined) {
            return res.status(400).json({
                message: "Missing required field: quantity"
            });
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
            return res.status(404).json({
                message: "Inventory item not found"
            });
        }

        const item = result.rows[0];

        await logAction(
            req.user,
            `Oppdaterte inventar: ${item.name} → ny mengde ${item.quantity}`
        );

        res.json(item);

    } catch (err) {
        console.error("updateInventory error:", err);
        res.status(500).json({ message: "Failed to update inventory item" });
    }
}

// DELETE api/inventory/:id
async function deleteInventory(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM inventory WHERE id = $1 RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Inventory item not found"
            });
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

    } catch (err) {
        console.error("deleteInventory error:", err);
        res.status(500).json({
            message: "Failed to delete inventory item"
        });
    }
}

module.exports = {
    getInventory,
    createInventory,
    updateInventory,
    deleteInventory
};