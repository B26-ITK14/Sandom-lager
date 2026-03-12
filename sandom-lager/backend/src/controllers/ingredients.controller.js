const pool = require("../db/pool");
const ApiError = require("../utils/ApiError");

// GET api/ingredients - Get all ingredients
async function getIngredients(req, res) {

    const result = await pool.query("SELECT * FROM ingredients ORDER BY name DESC");

    res.json(result.rows);
}

// GET api/ingredients/:id - Get a single ingredient by ID
async function getIngredientById(req, res) {

    const { id } = req.params;
    const result = await pool.query("SELECT * FROM ingredients WHERE id = $1", [id]);

    if (result.rows.length === 0) {
        throw new ApiError(404, "Ingredient not found");
    }

    res.json(result.rows[0]);
}

// POST api/ingredients - Create a new ingredient
async function createIngredient(req, res) {

    const { name, unit } = req.body;

    if (!name || !unit) {
        throw new ApiError(400, "Missing required fields: name and unit");
    }
        
    const result = await pool.query(
        "INSERT INTO ingredients (name, unit) VALUES ($1, $2) RETURNING *",
        [name, unit]
    );

    res.status(201).json(result.rows[0]);
}

// PUT api/ingredients/:id - Update an existing ingredient
async function updateIngredient(req, res) {
    
    const { id } = req.params;
    const { name, unit } = req.body;
        
    const result = await pool.query(
        "UPDATE ingredients SET name = $1, unit = $2 WHERE id = $3 RETURNING *",
        [name, unit, id]
    );

    if (result.rows.length === 0) {
        throw new ApiError(404, "Ingredient not found");
    }

    res.json(result.rows[0]);
}

// DELETE api/ingredients/:id - Delete an ingredient
async function deleteIngredient(req, res) {

    const { id } = req.params;

    const result = await pool.query("DELETE FROM ingredients WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
        throw new ApiError(404, "Ingredient not found");
    }

    res.json({ message: "Ingredient deleted successfully", deleted: result.rows[0] });
}

module.exports = {
    getIngredients,
    getIngredientById,
    createIngredient,
    updateIngredient,
    deleteIngredient
};