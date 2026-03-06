const express = require("express");
const router = express.Router();

const { checkJwt } = require("../middleware/checkJwt");
const { syncUser } = require("../middleware/syncUser");
const { requireRole } = require("../middleware/requireRole");

const { 
    getRecipeIngredients,
    addRecipeIngredient,
    updateRecipeIngredient,
    deleteRecipeIngredient
} = require("../controllers/recipeIngredients.controller");

// GET - All users allowed
router.get("/recipes/:id/ingredients", 
    checkJwt(),
    syncUser,
    getRecipeIngredients
);

// POST - Requires admin or manager role
router.post("/recipes/:id/ingredients", 
    checkJwt(),
    syncUser,
    requireRole("admin", "manager"),
    addRecipeIngredient
);

// PUT - Requires admin or manager role
router.put("/recipe-ingredients/:id", 
    checkJwt(),
    syncUser,
    requireRole("admin", "manager"),
    updateRecipeIngredient
);

// DELETE - Requires admin role
router.delete("/recipe-ingredients/:id", 
    checkJwt(),
    syncUser,
    requireRole("admin"),
    deleteRecipeIngredient
);

module.exports = router;