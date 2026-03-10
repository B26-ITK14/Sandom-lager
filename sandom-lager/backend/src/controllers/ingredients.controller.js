const pool = require("../db/pool");

// GET api/ingredients - Get all ingredients
async function getIngredients(req, res) {
    try {
        const result = await pool.query("SELECT * FROM ingredients ORDER BY name DESC");
        res.json(result.rows);
    } catch (err) {
        console.error("getIngredients error:", err);
        res.status(500).json({ message: "Failed to fetch ingredients" });
    }
}

// GET api/ingredients/:id - Get a single ingredient by ID
async function getIngredientById(req, res) {
    try {
        const { id } = req.params;
        const result = await pool.query("SELECT * FROM ingredients WHERE id = $1", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Ingredient not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("getIngredientById error:", err);
        res.status(500).json({ message: "Failed to fetch ingredient" });
    }
}

// POST api/ingredients - Create a new ingredient
async function createIngredient(req, res) {
    try {
        const { name, unit } = req.body;
        if (!name || !unit) {
            return res.status(400).json({ message: "Missing required fields: name and unit" });
        }
        const result = await pool.query(
            "INSERT INTO ingredients (name, unit) VALUES ($1, $2) RETURNING *",
            [name, unit]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("createIngredient error:", err);
        res.status(500).json({ message: "Failed to create ingredient" });
    }
}

// PUT api/ingredients/:id - Update an existing ingredient
async function updateIngredient(req, res) {
    try {
        const { id } = req.params;
        const { name, unit } = req.body;
        
        const result = await pool.query(
            "UPDATE ingredients SET name = $1, unit = $2 WHERE id = $3 RETURNING *",
            [name, unit, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Ingredient not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("updateIngredient error:", err);
        res.status(500).json({ message: "Failed to update ingredient" });
    }
}

// DELETE api/ingredients/:id - Delete an ingredient
async function deleteIngredient(req, res) {
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM ingredients WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Ingredient not found" });
        }
        res.json({ message: "Ingredient deleted successfully", deleted: result.rows[0] });
    } catch (err) {
        console.error("deleteIngredient error:", err);
        res.status(500).json({ message: "Failed to delete ingredient" });
    }
}

module.exports = {
    getIngredients,
    getIngredientById,
    createIngredient,
    updateIngredient,
    deleteIngredient
};