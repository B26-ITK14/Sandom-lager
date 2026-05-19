/*
 * recipes.controller.js
 * Controller for recipe CRUD and retrieval operations.
 * Author: Emil Berglund, Sebastian Thomsen & Andreas Skaarberg
 */
const pool = require("../db/pool");
const { logAction } = require("../utils/logger");
const ApiError = require("../utils/ApiError");

// Helper – henter én oppskrift med allergener
async function getRecipeWithAllergens(id) {
    const result = await pool.query(
        `SELECT r.id, r.title, c.name AS category, r.instructions, r.image_url, r.image_public_id, r.servings, r.created_at,
          COALESCE(array_agg(a.name ORDER BY a.name) FILTER (WHERE a.name IS NOT NULL), '{}') AS allergens
         FROM recipes r
         LEFT JOIN categories c ON c.id = r.category_id
         LEFT JOIN recipe_allergens ra ON ra.recipe_id = r.id
         LEFT JOIN allergens a ON a.id = ra.allergen_id
         WHERE r.id = $1
         GROUP BY r.id, c.name`,
        [id],
    );
    return result.rows[0] ?? null;
}

// GET /recipes
async function getAllRecipes(req, res) {
    const result = await pool.query(
        `SELECT r.id, r.title, c.name AS category, r.instructions, r.image_url, r.image_public_id, r.servings, r.created_at,
          COALESCE(array_agg(a.name ORDER BY a.name) FILTER (WHERE a.name IS NOT NULL), '{}') AS allergens
         FROM recipes r
         LEFT JOIN categories c ON c.id = r.category_id
         LEFT JOIN recipe_allergens ra ON ra.recipe_id = r.id
         LEFT JOIN allergens a ON a.id = ra.allergen_id
         GROUP BY r.id, c.name
         ORDER BY r.id DESC`,
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
    const {
        title,
        category,
        instructions,
        servings,
        image_url,
        image_public_id,
    } = req.body;

    if (!title) {
        throw new ApiError(400, "Missing required field: title");
    }

    const catResult = await pool.query(
        "SELECT id FROM categories WHERE LOWER(name) = LOWER($1)",
        [category]
    );
    if (!catResult.rows[0]) throw new ApiError(400, `Ugyldig kategori: ${category}`);
    const categoryId = catResult.rows[0].id;

    const result = await pool.query(
        `INSERT INTO recipes 
        (title, category_id, instructions, image_url, image_public_id, servings)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [
            title,
            categoryId,
            instructions,
            image_url ?? null,
            image_public_id ?? null,
            servings ?? 8,
        ],
    );

    const recipe = result.rows[0];

    await logAction(req.user, `Opprettet oppskriften "${recipe.title}"`);

    res.status(201).json({ ...recipe, allergens: [] });
}

// PUT /recipes/:id
async function updateRecipe(req, res) {
    const { id } = req.params;
    const {
        title,
        category,
        instructions,
        servings,
        image_url,
        image_public_id,
    } = req.body;

    if (!title) {
        throw new ApiError(400, "Missing required field: title");
    }

    const catResult = await pool.query(
        "SELECT id FROM categories WHERE LOWER(name) = LOWER($1)",
        [category]
    );
    if (!catResult.rows[0]) throw new ApiError(400, `Ugyldig kategori: ${category}`);
    const categoryId = catResult.rows[0].id;

    const updateResult = await pool.query(
        `UPDATE recipes
         SET title = $1, category_id = $2, instructions = $3, image_url = $4, image_public_id = $5, servings = $6
         WHERE id = $7
         RETURNING *`,
        [
            title,
            categoryId,
            instructions,
            image_url ?? null,
            image_public_id ?? null,
            servings ?? 8,
            id,
        ],
    );

    if (updateResult.rows.length === 0) {
        throw new ApiError(404, "Recipe not found");
    }

    const recipe = await getRecipeWithAllergens(id);

    await logAction(req.user, `Oppdaterte oppskriften "${recipe.title}"`);

    res.json(recipe);
}

// DELETE /recipes/:id
async function deleteRecipe(req, res) {
    const { id } = req.params;

    const recipeResult = await pool.query(
        `SELECT title FROM recipes WHERE id = $1`,
        [id],
    );

    const recipeTitle = recipeResult.rows[0]?.title || `ID ${id}`;

    const result = await pool.query(`DELETE FROM recipes WHERE id = $1`, [id]);

    if (result.rowCount === 0) {
        throw new ApiError(404, "Recipe not found");
    }

    await logAction(req.user, `Slettet oppskriften "${recipeTitle}"`);

    res.json({ message: "Recipe deleted" });
}

// GET /recipes/allergens
async function getAllAllergens(req, res) {
    const result = await pool.query(
        "SELECT id, name FROM allergens ORDER BY name",
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
            [id, allergenId],
        );
    }

    const recipe = await getRecipeWithAllergens(id);
    if (!recipe) throw new ApiError(404, "Recipe not found");

    res.json(recipe);
}

// POST /recipes/allergens
async function createAllergen(req, res) {
    const { name } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
        throw new ApiError(400, "name is required");
    }
    const trimmed = name.trim();
    const existing = await pool.query(
        "SELECT id FROM allergens WHERE LOWER(name) = LOWER($1)",
        [trimmed]
    );
    if (existing.rows.length > 0) {
        throw new ApiError(409, "Allergenet finnes allerede");
    }
    const result = await pool.query(
        "INSERT INTO allergens (name) VALUES ($1) RETURNING id, name",
        [trimmed]
    );
    res.status(201).json(result.rows[0]);
}

// DELETE /recipes/allergens/:id
async function deleteAllergen(req, res) {
    const { id } = req.params;
    const inUse = await pool.query(
        "SELECT 1 FROM recipe_allergens WHERE allergen_id = $1 LIMIT 1",
        [id]
    );
    if (inUse.rows.length > 0) {
        throw new ApiError(409, "Allergenet er i bruk av én eller flere oppskrifter og kan ikke slettes");
    }
    const result = await pool.query(
        "DELETE FROM allergens WHERE id = $1 RETURNING id",
        [id]
    );
    if (result.rows.length === 0) throw new ApiError(404, "Allergen ikke funnet");
    res.status(204).send();
}

// GET /recipes/categories
async function getAllCategories(req, res) {
    const result = await pool.query("SELECT id, name FROM categories ORDER BY name");
    res.json(result.rows);
}

// POST /recipes/categories
async function createCategory(req, res) {
    const { name } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
        throw new ApiError(400, "navn er påkrevd");
    }
    const trimmed = name.trim();
    const existing = await pool.query(
        "SELECT id FROM categories WHERE LOWER(name) = LOWER($1)",
        [trimmed]
    );
    if (existing.rows.length > 0) {
        throw new ApiError(409, "Kategorien finnes allerede");
    }
    const result = await pool.query(
        "INSERT INTO categories (name) VALUES ($1) RETURNING id, name",
        [trimmed]
    );
    res.status(201).json(result.rows[0]);
}

// DELETE /recipes/categories/:id
async function deleteCategory(req, res) {
    const { id } = req.params;
    const cat = await pool.query("SELECT name FROM categories WHERE id = $1", [id]);
    if (cat.rows.length === 0) throw new ApiError(404, "Kategori ikke funnet");

    const inUse = await pool.query(
        "SELECT 1 FROM recipes WHERE category_id = $1 LIMIT 1",
        [id]
    );
    if (inUse.rows.length > 0) {
        throw new ApiError(409, "Kategorien er i bruk av én eller flere oppskrifter og kan ikke slettes");
    }
    await pool.query("DELETE FROM categories WHERE id = $1", [id]);
    res.status(204).send();
}

module.exports = {
    getAllRecipes,
    getRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    getAllAllergens,
    setRecipeAllergens,
    createAllergen,
    deleteAllergen,
    getAllCategories,
    createCategory,
    deleteCategory
};
