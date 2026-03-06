const express = require("express");
const router = express.Router();

const { checkJwt } = require("../middleware/checkJwt");
const { syncUser } = require("../middleware/syncUser");
const { requireRole } = require("../middleware/requireRole");

const recipesController = require("../controllers/recipes.controller");

// All users can access and read recipes. 
// Get all recipes
router.get(
    "/", 
    checkJwt(),
    syncUser,
    recipesController.getAllRecipes
);

// Get recipe by ID
router.get(
    "/:id", 
    checkJwt(),
    syncUser,
    recipesController.getRecipeById
);

// Manager and admin can create recipes
router.post(
    "/", 
    checkJwt(),
    syncUser,
    requireRole("manager", "admin"),
    recipesController.createRecipe
);

// Manager and admin can update recipes
router.put(
    "/:id", 
    checkJwt(), 
    syncUser,
    requireRole("manager", "admin"),
    recipesController.updateRecipe
);

// Admin can delete recipes
router.delete(
    "/:id",
    checkJwt(),
    syncUser,
    requireRole("admin"),
    recipesController.deleteRecipe
);

module.exports = router;