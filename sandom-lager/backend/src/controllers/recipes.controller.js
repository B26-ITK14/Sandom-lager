const pool = require("../db/pool");
const { logAction } = require("../utils/logger");
const ApiError = require("../utils/ApiError");

// Helper – henter én oppskrift med allergener
async function getRecipeWithAllergens(id) {
    const result = await pool.query(
                `SELECT r.id, r.title, r.category, r.instructions, r.image_url, r.image_public_id, r.servings, r.created_at,
          COALESCE(array_agg(a.name ORDER BY a.name) FILTER (WHERE a.name IS NOT NULL), '{}') AS allergens
         FROM recipes r
         LEFT JOIN recipe_allergens ra ON ra.recipe_id = r.id
         LEFT JOIN allergens a ON a.id = ra.allergen_id
         WHERE r.id = $1
         GROUP BY r.id`,
        [id]
    );
    return result.rows[0] ?? null;
}

// GET /recipes
async function getAllRecipes(req, res) {
    const result = await pool.query(
                `SELECT r.id, r.title, r.category, r.instructions, r.image_url, r.image_public_id, r.servings, r.created_at,
          COALESCE(array_agg(a.name ORDER BY a.name) FILTER (WHERE a.name IS NOT NULL), '{}') AS allergens
         FROM recipes r
         LEFT JOIN recipe_allergens ra ON ra.recipe_id = r.id
         LEFT JOIN allergens a ON a.id = ra.allergen_id
         GROUP BY r.id
         ORDER BY r.id DESC`
    );
    res.json(result.rows);
}

// GET /recipes/:id
async function getRecipeById(req, res) {
    const { id } = req.params;
    const recipe = await getRecipeWithAllergens(id);
    if (!recipe) throw new ApiError(404, "Recipe not found");
    res.json(recipe);
}

// POST /recipes
async function createRecipe(req, res) {

    const { title, category, instructions, servings, image_url, image_public_id } = req.body;

    if (!title) {
        throw new ApiError(400, "Missing required field: title");
    }

    const result = await pool.query(
        `INSERT INTO recipes 
        (title, category, instructions, image_url, image_public_id, servings)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [title, category, instructions, image_url ?? null, image_public_id ?? null, servings ?? 4]
    );

    const recipe = result.rows[0];

    await logAction(
        req.user,
        `Opprettet oppskriften "${recipe.title}"`
    );

    res.status(201).json({ ...recipe, allergens: [] });
}

// PUT /recipes/:id
async function updateRecipe(req, res) {

    const { id } = req.params;
    const { title, category, instructions, servings, image_url, image_public_id } = req.body;

    if (!title) {
        throw new ApiError(400, "Missing required field: title");
    }

    const updateResult = await pool.query(
        `UPDATE recipes
         SET title = $1, category = $2, instructions = $3, image_url = $4, image_public_id = $5, servings = $6
         WHERE id = $7
         RETURNING *`,
        [title, category, instructions, image_url ?? null, image_public_id ?? null, servings ?? 4, id]
    );

    if (updateResult.rows.length === 0) {
        throw new ApiError(404, "Recipe not found");
    }

    const recipe = await getRecipeWithAllergens(id);

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

// GET /recipes/allergens
async function getAllAllergens(req, res) {
    const result = await pool.query(
        "SELECT id, name FROM allergens ORDER BY name"
    );
    res.json(result.rows);
}

// PUT /recipes/:id/allergens
async function setRecipeAllergens(req, res) {
    const { id } = req.params;
    const { allergen_ids } = req.body;

    if (!Array.isArray(allergen_ids)) {
        throw new ApiError(400, "allergen_ids must be an array");
    }

    await pool.query("DELETE FROM recipe_allergens WHERE recipe_id = $1", [id]);

    for (const allergenId of allergen_ids) {
        await pool.query(
            "INSERT INTO recipe_allergens (recipe_id, allergen_id) VALUES ($1, $2)",
            [id, allergenId]
        );
    }

    const recipe = await getRecipeWithAllergens(id);
    if (!recipe) throw new ApiError(404, "Recipe not found");

    res.json(recipe);
}

module.exports = {
    getAllRecipes,
    getRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    getAllAllergens,
    setRecipeAllergens
};
