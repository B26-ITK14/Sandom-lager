const pool = require("../db/pool");

// GET /api/recipes/:id/ingredients
// Henter alle ingredienser for en spesifikk oppskrift
// Returnerer liste med ingrediens-navn, mengde og enhet
async function getRecipeIngredients(req, res) {
    const { id } = req.params;    
    try{
        const result = await pool.query(
            `SELECT 
                ri.id, 
                ri.quantity,
                i.name as ingredient_name, 
                i.unit 
            FROM recipe_ingredients ri
            JOIN ingredients i ON ri.ingredient_id = i.id 
            WHERE ri.recipe_id = $1`, [id]
            
        );
        res.status(200).json(result.rows)
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
}

// POST /api/recipes/:id/ingredients
// Legger til en ingrediens til en oppskrift
// Body: { ingredient_id: number, quantity: number }
async function addRecipeIngredient(req, res) {
    const { id } = req.params;
    const { ingredient_id, quantity } = req.body;
    try{
        const result = await pool.query(
            `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [id, ingredient_id, quantity]
        )
        res.status(201).json(result.rows[0])
    }catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
}

// PUT /api/recipe-ingredients/:id
// Oppdaterer mengde for en ingrediens i en oppskrift
// Body: { quantity: number }
async function updateRecipeIngredient(req, res) {
    const { id } = req.params;
    const { quantity } = req.body;
    try{
        const result = await pool.query(
            `UPDATE recipe_ingredients
            SET quantity = $1
            WHERE id = $2
            RETURNING *`, [quantity, id]
        )
        res.status(200).json(result.rows[0])
    }catch (err){
        console.error(err);
        res.status(500).send("Database error");
    }    
}

// DELETE /api/recipe-ingredients/:id
// Fjerner en ingrediens fra en oppskrift
// Returnerer bekreftelse med slettet data
async function deleteRecipeIngredient(req, res) {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `DELETE FROM recipe_ingredients 
             WHERE id = $1
             RETURNING *`, [id]
        );
        res.json({ 
            message: "Ingrediens fjernet", 
            deleted: result.rows[0] 
        });
    } catch(err) {
        console.error(err);
        res.status(500).send("Database error");
    }
}

module.exports = {
    getRecipeIngredients,
    addRecipeIngredient,
    updateRecipeIngredient,
    deleteRecipeIngredient
}