/*
    * recipeIngredients.routes.js
    * Routes for managing recipe-ingredient relationships.
    * Author: Andreas Skaarberg
*/
const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");

const { checkJwt } = require("../middleware/checkJwt");
const { syncUser } = require("../middleware/syncUser");
const { requireRole } = require("../middleware/requireRole");

const recipeIngredientsController = require("../controllers/recipeIngredients.controller");

// Apply authentication and user synchronization middleware to all routes in this router
router.use(checkJwt())
router.use(syncUser)

// GET - All users allowed
router.get("/recipes/:id/ingredients",
    requireRole("user", "admin", "manager"),
    asyncHandler(recipeIngredientsController.getRecipeIngredients)
);

// POST - Requires admin or manager role
router.post("/recipes/:id/ingredients",
    requireRole("admin", "manager"),
    asyncHandler(recipeIngredientsController.addRecipeIngredient)
);

// PUT - Requires admin or manager role
router.put("/recipe-ingredients/:id",
    requireRole("admin", "manager"),
    asyncHandler(recipeIngredientsController.updateRecipeIngredient)
);

// DELETE - Requires admin role
router.delete("/recipe-ingredients/:id",
    requireRole("admin"),
    asyncHandler(recipeIngredientsController.deleteRecipeIngredient)
);

module.exports = router;