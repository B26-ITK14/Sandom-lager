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

// POST api/inventory - Add a new inventory item
async function createInventory(req, res) {
    try {
        const { ingredient_id, location_id, quantity } = req.body;

        // Validate required fields
        if (!ingredient_id || !location_id || quantity === undefined) {
            return res.status(400).json({ message: "Missing required fields: ingredient_id, location_id, quantity" });
        }

        const result = await pool.query(
            "INSERT INTO inventory (ingredient_id, location_id, quantity) VALUES ($1, $2, $3) RETURNING *",
            [ingredient_id, location_id, quantity]
        );

        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error("createInventory error:", err);
        res.status(500).json({ message: "Failed to create inventory item" });
    }
}

// PUT api/inventory/:id - Update an existing inventory item
async function updateInventory(req, res) {
    try {
        const { id } = req.params;
        const { quantity } = req.body;  

        // Validate required fields
        if (quantity === undefined) {
            return res.status(400).json({ message: "Missing required field: quantity" });
        }

        const result = await pool.query(
            "UPDATE inventory SET quantity = $1 WHERE id = $2 RETURNING *",
            [quantity, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Inventory item not found" });
        }

        //Log the inventory update event
        await logAction(
            req.user,
            `Inventar oppdatert: ID ${id}, ny mengde: ${quantity}`
        );

        res.json(result.rows[0]);

    } catch (err) {
        console.error("updateInventory error:", err);
        res.status(500).json({ message: "Failed to update inventory item" });
    }
}

// DELETE api/inventory/:id - Delete an inventory item
async function deleteInventory(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query("DELETE FROM inventory WHERE id = $1 RETURNING *", [id]);

        // If no inventory item is found with the given ID, return a 404 error
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Inventory item not found" });
        }

         res.json({
            message: "Inventory item deleted",
            deleted: result.rows[0]
            })

    } catch (err) {
        console.error("deleteInventory error:", err);
        res.status(500).json({ message: "Failed to delete inventory item" });
    }
}

module.exports = {
    getInventory,
    createInventory,
    updateInventory,
    deleteInventory
};
