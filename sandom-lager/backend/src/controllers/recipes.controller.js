const pool = require("../db/pool");
const { logAction } = require("../utils/logger");
const ApiError = require("../utils/ApiError");

// GET /recipes
async function getAllRecipes(req, res) {
    const userId = req.user.id;

    const locationResult = await pool.query(
        `SELECT location_id FROM user_locations 
         WHERE user_id = $1 AND access_status = 'approved' 
         LIMIT 1`,
        [userId]
    );

    if (locationResult.rows.length === 0) {
        throw new ApiError(403, "No approved location found for user");
    }

    const locationId = locationResult.rows[0].location_id;

    const result = await pool.query(
        "SELECT * FROM recipes WHERE location_id = $1 ORDER BY id DESC",
        [locationId]
    );

    res.json(result.rows);
}

// GET /recipes/:id
async function getRecipeById(req, res) {
    
    const { id } = req.params;

    const result = await pool.query(
        "SELECT * FROM recipes WHERE id = $1",
        [id]
    );

    if (result.rows.length === 0) {
        throw new ApiError(404, "Recipe not found");
        }
        

    res.json(result.rows[0]);

}

// POST /recipes
async function createRecipe(req, res) {
    
    const { title, category, instructions, location_id, servings } = req.body;

    if (!title) {
        throw new ApiError(400, "Missing required field: title");
    }

    const result = await pool.query(
        `INSERT INTO recipes 
        (title, category, instructions, location_id, servings)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [title, category, instructions, location_id, servings ?? 4]
    );

    const recipe = result.rows[0];

    await logAction(
        req.user,
        `Opprettet oppskriften "${recipe.title}"`
    );

    res.status(201).json(recipe);
}

// PUT /recipes/:id
async function updateRecipe(req, res) {

    const { id } = req.params;
    const { title, category, instructions, servings } = req.body;

    if (!title) {
        throw new ApiError(400, "Missing required field: title");
    }

    const result = await pool.query(
        `UPDATE recipes
         SET title = $1, category = $2, instructions = $3, servings = $4
         WHERE id = $5
         RETURNING *`,
        [title, category, instructions, servings ?? 4, id]
    );

    if (result.rows.length === 0) {
        throw new ApiError(404, "Recipe not found");
    }

    const recipe = result.rows[0];

    await logAction(
        req.user,
        `Oppdaterte oppskriften "${recipe.title}"`
    );

    res.json(recipe);
}

// DELETE /recipes/:id
async function deleteRecipe(req, res) {
    
    const { id } = req.params;

    const recipeResult = await pool.query(
        `SELECT title FROM recipes WHERE id = $1`,
        [id]
    );

    const recipeTitle =
        recipeResult.rows[0]?.title || `ID ${id}`;

    const result = await pool.query(
        `DELETE FROM recipes WHERE id = $1`,
        [id]
    );

    if (result.rowCount === 0) {
        throw new ApiError(404, "Recipe not found");
    }

    await logAction(
        req.user,
        `Slettet oppskriften "${recipeTitle}"`
    );

    res.json({ message: "Recipe deleted" });
}

module.exports = {
    getAllRecipes,
    getRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe
};
