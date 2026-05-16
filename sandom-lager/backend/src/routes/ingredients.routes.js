/*
    * ingredients.routes.js
    * Routes for ingredient CRUD and search endpoints.
    * Author:
*/
const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");

const { checkJwt } = require("../middleware/checkJwt");
const { syncUser } = require("../middleware/syncUser");
const { requireRole } = require("../middleware/requireRole");

const ingredientsController = require("../controllers/ingredients.controller");

// Apply authentication and user synchronization middleware to all routes in this router
router.use(checkJwt())
router.use(syncUser)

// GET - All users can read ingredients
router.get(
    "/ingredients",
    requireRole("user", "manager", "admin"),
    asyncHandler(ingredientsController.getIngredients)
);

// GET - All users can read ingredient by ID
router.get(
    "/ingredients/:id",
    requireRole("user", "manager", "admin"),
    asyncHandler(ingredientsController.getIngredientById)
);

// POST - Admin and manager can create ingredients
router.post(
    "/ingredients",
    requireRole("admin", "manager"),
    asyncHandler(ingredientsController.createIngredient)
);

// PUT - Admin and manager can update ingredients
router.put(
    "/ingredients/:id",
    requireRole("admin", "manager"),
    asyncHandler(ingredientsController.updateIngredient)
);

// DELETE - Admin can delete ingredients
router.delete(
    "/ingredients/:id",
    requireRole("admin"),
    asyncHandler(ingredientsController.deleteIngredient)
);

module.exports = router;