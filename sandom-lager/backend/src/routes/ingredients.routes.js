const express = require("express");
const router = express.Router();

const { checkJwt } = require("../middleware/checkJwt");
const { syncUser } = require("../middleware/syncUser");
const { requireRole } = require("../middleware/requireRole");

const {
    getIngredients,
    getIngredientById,
    createIngredient,
    updateIngredient,
    deleteIngredient
} = require("../controllers/ingredients.controller");

// GET - All users can read ingredients
router.get(
    "/ingredients",
    checkJwt(),
    syncUser,
    requireRole("user", "manager", "admin"), 
    getIngredients
);

// GET - All users can read ingredient by ID
router.get(
    "/ingredients/:id",
    checkJwt(),
    syncUser,
    requireRole("user", "manager", "admin"),
    getIngredientById
);

// POST - Admin and manager can create ingredients
router.post(
    "/ingredients",
    checkJwt(),
    syncUser,
    requireRole("admin", "manager"),
    createIngredient
);

// PUT - Admin and manager can update ingredients
router.put(
    "/ingredients/:id",
    checkJwt(),
    syncUser,
    requireRole("admin", "manager"),
    updateIngredient
);

// DELETE - Admin can delete ingredients
router.delete(
    "/ingredients/:id",
    checkJwt(),
    syncUser,
    requireRole("admin"),
    deleteIngredient
);

module.exports = router;