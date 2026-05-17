const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");

const { checkJwt } = require("../middleware/checkJwt");
const { syncUser } = require("../middleware/syncUser");
const { requireRole } = require("../middleware/requireRole");

const recipesController = require("../controllers/recipes.controller");

// Apply authentication and user synchronization middleware to all routes in this router
router.use(checkJwt())
router.use(syncUser)

// All users can access and read recipes. 
// Get all recipes
router.get(
    "/", 
    requireRole("user", "manager", "admin"), // All roles can access
    asyncHandler(recipesController.getAllRecipes)
);

// Get all allergens (for recipe forms)
router.get(
    "/allergens",
    requireRole("user", "manager", "admin"),
    asyncHandler(recipesController.getAllAllergens)
);

// Manager and admin can create new allergens
router.post(
    "/allergens",
    requireRole("manager", "admin"),
    asyncHandler(recipesController.createAllergen)
);

// Manager and admin can delete allergens (only if not in use)
router.delete(
    "/allergens/:id",
    requireRole("manager", "admin"),
    asyncHandler(recipesController.deleteAllergen)
);

// Get recipe by ID
router.get(
    "/:id", 
    requireRole("user", "manager", "admin"),
    asyncHandler(recipesController.getRecipeById)
);

// Manager and admin can create recipes
router.post(
    "/", 
    requireRole("manager", "admin"),
    asyncHandler(recipesController.createRecipe)
);

// Manager and admin can update recipes
router.put(
    "/:id", 
    requireRole("manager", "admin"),
    asyncHandler(recipesController.updateRecipe)
);

// Admin can delete recipes
router.delete(
    "/:id",
    requireRole("admin"),
    asyncHandler(recipesController.deleteRecipe)
);

// Manager and admin can set allergens for a recipe
router.put(
    "/:id/allergens",
    requireRole("manager", "admin"),
    asyncHandler(recipesController.setRecipeAllergens)
);

module.exports = router;