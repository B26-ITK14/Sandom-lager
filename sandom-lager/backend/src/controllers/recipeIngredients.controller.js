const pool = require("../db/pool");
const ApiError = require("../utils/ApiError");

// GET /api/recipes/:id/ingredients
// Henter alle ingredienser for en spesifikk oppskrift
// Returnerer liste med ingrediens-navn, mengde og enhet
async function getRecipeIngredients(req, res) {

    const { id } = req.params;    

    const result = await pool.query(
        `SELECT 
            ri.id,
            ri.recipe_id,
            ri.ingredient_id,
            ri.quantity,
            i.name as ingredient_name, 
            i.unit 
        FROM recipe_ingredients ri
        JOIN ingredients i ON ri.ingredient_id = i.id 
        WHERE ri.recipe_id = $1`, [id]    
    );

    res.json(result.rows)
}

// POST /api/recipes/:id/ingredients
// Legger til en ingrediens til en oppskrift
// Body: { ingredient_id: number, quantity: number }
async function addRecipeIngredient(req, res) {

    const { id } = req.params;
    const { ingredient_id, quantity } = req.body;

    if (!ingredient_id || quantity === undefined) {
        throw new ApiError(400, "Missing required fields: ingredient_id and quantity");
    }

    const result = await pool.query(
        `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
        VALUES ($1, $2, $3)
        RETURNING *`,
        [id, ingredient_id, quantity]
    );

    res.status(201).json(result.rows[0])
}

// PUT /api/recipe-ingredients/:id
// Oppdaterer mengde for en ingrediens i en oppskrift
// Body: { quantity: number }
async function updateRecipeIngredient(req, res) {

    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
        throw new ApiError(400, "Missing required field: quantity");
    }
    
    const result = await pool.query(
        `UPDATE recipe_ingredients
         SET quantity = $1
         WHERE id = $2
         RETURNING *`,
        [quantity, id]
    );

    if (result.rows.length === 0) {
        throw new ApiError(404, "Recipe ingredient not found");
    }

    res.json(result.rows[0]);
}

// DELETE /api/recipe-ingredients/:id
// Fjerner en ingrediens fra en oppskrift
// Returnerer bekreftelse med slettet data
async function deleteRecipeIngredient(req, res) {

    const { id } = req.params;
    
    const result = await pool.query(
        `DELETE FROM recipe_ingredients 
         WHERE id = $1
         RETURNING *`, [id]
    );

    if (result.rows.length === 0) {
        throw new ApiError(404, "Recipe ingredient not found");
    }

    res.json({ 
        message: "Ingrediens fjernet", 
        deleted: result.rows[0] 
    });
}

module.exports = {
    getRecipeIngredients,
    addRecipeIngredient,
    updateRecipeIngredient,
    deleteRecipeIngredient
}