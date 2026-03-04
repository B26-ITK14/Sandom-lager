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

// GET - Krever user rolle
router.get("/recipes/:id/ingredients", 
    checkJwt(),
    syncUser,
    requireRole("user"),
    getRecipeIngredients
);

// POST - Krever admin eller manager
router.post("/recipes/:id/ingredients", 
    checkJwt(),
    syncUser,
    requireRole("admin", "manager"),
    addRecipeIngredient
);

// PUT - Krever admin eller manager
router.put("/recipe-ingredients/:id", 
    checkJwt(),
    syncUser,
    requireRole("admin", "manager"),
    updateRecipeIngredient
);

// DELETE - Krever admin
router.delete("/recipe-ingredients/:id", 
    checkJwt(),
    syncUser,
    requireRole("admin"),
    deleteRecipeIngredient
);

module.exports = router;