const pool = require('../db/pool');
const ApiError = require('../utils/ApiError');

async function getApprovedLocationId(userId) {
    const userLocationResult = await pool.query(
        `SELECT location_id FROM user_locations
         WHERE user_id = $1 AND access_status = 'approved'
         LIMIT 1`,
        [userId]
    );

    if (userLocationResult.rows.length === 0) {
        throw new ApiError(403, "No approved location access");
    }

    return Number(userLocationResult.rows[0].location_id);
}

async function resolveIngredientId({ ingredient_id, ingredient_name, unit }) {
    if (ingredient_id !== undefined && ingredient_id !== null) {
        const parsedIngredientId = Number(ingredient_id);

        if (!Number.isFinite(parsedIngredientId)) {
            throw new ApiError(400, "Invalid ingredient_id");
        }

        const ingredientCheck = await pool.query(
            "SELECT id FROM ingredients WHERE id = $1",
            [parsedIngredientId]
        );

        if (ingredientCheck.rows.length === 0) {
            throw new ApiError(400, "Invalid ingredient_id");
        }

        return parsedIngredientId;
    }

    const cleanedName = typeof ingredient_name === "string" ? ingredient_name.trim() : "";
    const cleanedUnit = typeof unit === "string" ? unit.trim() : "";

    if (!cleanedName || !cleanedUnit) {
        throw new ApiError(400, "Missing required fields: ingredient_name and unit");
    }

    const existingIngredient = await pool.query(
        "SELECT id FROM ingredients WHERE LOWER(name) = LOWER($1) LIMIT 1",
        [cleanedName]
    );

    if (existingIngredient.rows.length > 0) {
        return Number(existingIngredient.rows[0].id);
    }

    const insertedIngredient = await pool.query(
        "INSERT INTO ingredients (name, unit) VALUES ($1, $2) RETURNING id",
        [cleanedName, cleanedUnit]
    );

    return Number(insertedIngredient.rows[0].id);
}

async function ensureInventoryItem(locationId, ingredientId) {
    await pool.query(
        `INSERT INTO inventory (location_id, ingredient_id, quantity)
         VALUES ($1, $2, 0)
         ON CONFLICT (location_id, ingredient_id) DO NOTHING`,
        [locationId, ingredientId]
    );
}

// GET /api/shopping-list - Get shopping list items for user's approved location
async function getShoppingList(req, res) {
    const userId = req.user.id;
    const locationId = await getApprovedLocationId(userId);

    // Get shopping list items for that location
    const result = await pool.query(
        `SELECT 
            sl.id,
            sl.needed_quantity,
            i.name AS ingredient,
            COALESCE(sl.unit_override, i.unit) AS unit,
            l.name AS location,
            i.id AS ingredient_id,
            l.id AS location_id,
            COALESCE(inv.quantity, 0) AS stock_quantity
        FROM shopping_list sl
        JOIN ingredients i ON sl.ingredient_id = i.id
        JOIN locations l ON sl.location_id = l.id
        LEFT JOIN inventory inv ON inv.location_id = sl.location_id AND inv.ingredient_id = sl.ingredient_id
        WHERE sl.location_id = $1
        ORDER BY sl.created_at DESC`,
        [locationId]
    );

    res.json(result.rows);
}

// POST /api/shopping-list - Add a new item to the shopping list
async function createShoppingListItem(req, res) {
    const userId = req.user.id;
    const { ingredient_id, ingredient_name, unit, needed_quantity } = req.body;

    const parsedQuantity = Number(needed_quantity);

    // Validate required fields
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
        throw new ApiError(400, "Invalid needed_quantity");
    }

    const location_id = await getApprovedLocationId(userId);
    const resolvedIngredientId = await resolveIngredientId({ ingredient_id, ingredient_name, unit });

    // If a new ingredient was created, ensure it exists in this location's inventory with quantity 0.
    await ensureInventoryItem(location_id, resolvedIngredientId);

    // Check if item already exists in shopping list for this location
    const existingItem = await pool.query(
        `SELECT id, needed_quantity FROM shopping_list 
         WHERE ingredient_id = $1 AND location_id = $2`,
        [resolvedIngredientId, location_id]
    );

    if (existingItem.rows.length > 0) {
        // Update existing item instead of creating duplicate
        const result = await pool.query(
            `UPDATE shopping_list 
             SET needed_quantity = needed_quantity + $1,
                 unit_override = COALESCE($4, unit_override),
                 updated_at = NOW()
             WHERE ingredient_id = $2 AND location_id = $3 
             RETURNING *`,
            [parsedQuantity, resolvedIngredientId, location_id, unit || null]
        );
        res.status(200).json(result.rows[0]);
    } else {
        // Create new item
        const result = await pool.query(
            "INSERT INTO shopping_list (ingredient_id, location_id, needed_quantity, unit_override) VALUES ($1, $2, $3, $4) RETURNING *",
            [resolvedIngredientId, location_id, parsedQuantity, unit || null]
        );
        res.status(201).json(result.rows[0]);
    }
}

// PUT /api/shopping-list/:id - Update an existing shopping list item
async function updateShoppingListItem(req, res) {
    const userId = req.user.id;
    const { id } = req.params;
    const { needed_quantity, unit } = req.body;

    const locationId = await getApprovedLocationId(userId);

    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (needed_quantity !== undefined) {
        const parsedQuantity = Number(needed_quantity);
        if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
            throw new ApiError(400, "Invalid needed_quantity");
        }
        fields.push(`needed_quantity = $${paramIndex}`);
        values.push(parsedQuantity);
        paramIndex += 1;
    }

    if (unit !== undefined) {
        fields.push(`unit_override = $${paramIndex}`);
        values.push(unit || null);
        paramIndex += 1;
    }

    if (fields.length === 0) {
        throw new ApiError(400, "No updatable fields provided");
    }

    fields.push("updated_at = NOW()");

    values.push(id);
    values.push(locationId);

    // Only allow updating items in user's location
    const result = await pool.query(
        `UPDATE shopping_list 
         SET ${fields.join(", ")}
         WHERE id = $${paramIndex} AND location_id = $${paramIndex + 1} 
         RETURNING *`,
        values
    );

    if (result.rows.length === 0) {
        throw new ApiError(404, "Shopping list item not found or access denied");
    }

    res.json(result.rows[0]);
}

// DELETE /api/shopping-list/:id - Delete a shopping list item
async function deleteShoppingListItem(req, res) {
    const userId = req.user.id;
    const { id } = req.params;
    const locationId = await getApprovedLocationId(userId);

    // Only allow deleting items from user's location
    const result = await pool.query(
        `DELETE FROM shopping_list 
         WHERE id = $1 AND location_id = $2 
         RETURNING *`,
        [id, locationId]
    );

    if (result.rows.length === 0) {
        throw new ApiError(404, "Shopping list item not found or access denied");
    }

    res.json({ message: "Shopping list item deleted successfully", deleted: result.rows[0] });
}

// DELETE /api/shopping-list - Delete all shopping list items for user's location
async function clearShoppingList(req, res) {
    const userId = req.user.id;
    const locationId = await getApprovedLocationId(userId);

    const result = await pool.query(
        `DELETE FROM shopping_list
         WHERE location_id = $1
         RETURNING id`,
        [locationId]
    );

    res.json({
        message: "Shopping list cleared successfully",
        deletedCount: result.rowCount || 0,
    });
}

module.exports = {
    getShoppingList,
    createShoppingListItem,
    updateShoppingListItem,
    deleteShoppingListItem,
    clearShoppingList
};