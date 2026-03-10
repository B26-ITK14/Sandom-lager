const express = require('express');
const router = express.Router();

const { checkJwt } = require("../middleware/checkJwt");
const { syncUser } = require("../middleware/syncUser");
const { requireRole } = require("../middleware/requireRole");

const {
    getShoppingList,
    createShoppingListItem,
    updateShoppingListItem,
    deleteShoppingListItem
} = require("../controllers/shoppingList.controller");

// GET - All users can read shopping list
router.get(
    "/shopping-list",
    checkJwt(),
    syncUser,
    requireRole("user", "manager", "admin"),
    getShoppingList
);

// POST - Admin and manager can create shopping list items
router.post(
    "/shopping-list",
    checkJwt(),
    syncUser,
    requireRole("admin", "manager"),
    createShoppingListItem
);

// PUT - Admin and manager can update shopping list items
router.put(
    "/shopping-list/:id",
    checkJwt(),
    syncUser,
    requireRole("admin", "manager"),
    updateShoppingListItem
);

// DELETE - Admin can delete shopping list items
router.delete(
    "/shopping-list/:id",
    checkJwt(),
    syncUser,
    requireRole("admin"),
    deleteShoppingListItem
);

module.exports = router;