const pool = require("../db/pool");
const { logAction } = require("../utils/logger");

// GET /recipes
async function getAllRecipes(req, res) {
    try {
        const result = await pool.query(
            "SELECT * FROM recipes ORDER BY id DESC"
        );
        res.json(result.rows);
    } catch (err) {
        console.error("getAllRecipes error:", err);
        res.status(500).json({ message: "Failed to fetch recipes" });
    }
}

// GET /recipes/:id
async function getRecipeById(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM recipes WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Recipe not found"
            });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error("getRecipeById error:", err);
        res.status(500).json({ message: "Failed to fetch recipe" });
    }
}

// POST /recipes
async function createRecipe(req, res) {
    try {
        const { title, category, instructions, location_id } = req.body;

        const result = await pool.query(
            `INSERT INTO recipes 
            (title, category, instructions, location_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [title, category, instructions, location_id]
        );

        const recipe = result.rows[0];

        await logAction(
            req.user,
            `Opprettet oppskriften "${recipe.title}"`
        );

        res.status(201).json(recipe);

    } catch (err) {
        console.error("createRecipe error:", err);
        res.status(500).json({ message: "Failed to create recipe" });
    }
}

// PUT /recipes/:id
async function updateRecipe(req, res) {
    try {
        const { id } = req.params;
        const { title, category, instructions } = req.body;

        if (!title) {
            return res.status(400).json({
                message: "Title is required"
            });
        }

        const result = await pool.query(
            `UPDATE recipes
             SET title = $1, category = $2, instructions = $3
             WHERE id = $4
             RETURNING *`,
            [title, category, instructions, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Recipe not found"
            });
        }

        const recipe = result.rows[0];

        await logAction(
            req.user,
            `Oppdaterte oppskriften "${recipe.title}"`
        );

        res.json(recipe);

    } catch (err) {
        console.error("updateRecipe error:", err);
        res.status(500).json({ message: "Failed to update recipe" });
    }
}

// DELETE /recipes/:id
async function deleteRecipe(req, res) {
    try {
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
            return res.status(404).json({
                message: "Recipe not found"
            });
        }

        await logAction(
            req.user,
            `Slettet oppskriften "${recipeTitle}"`
        );

        res.json({ message: "Recipe deleted" });

    } catch (err) {
        console.error("deleteRecipe error:", err);
        res.status(500).json({ message: "Failed to delete recipe" });
    }
}

module.exports = {
    getAllRecipes,
    getRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe
};
