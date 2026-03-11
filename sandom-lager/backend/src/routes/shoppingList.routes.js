const express = require('express');
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");

const { checkJwt } = require("../middleware/checkJwt");
const { syncUser } = require("../middleware/syncUser");
const { requireRole } = require("../middleware/requireRole");

const shoppingListController = require("../controllers/shoppingList.controller");

// Apply authentication and user synchronization middleware to all routes in this router
router.use(checkJwt())
router.use(syncUser)

// GET - All users can read shopping list
router.get(
    "/shopping-list",
    requireRole("user", "manager", "admin"),
    asyncHandler(shoppingListController.getShoppingList)
);

// POST - Admin and manager can create shopping list items
router.post(
    "/shopping-list",
    requireRole("admin", "manager"),
    asyncHandler(shoppingListController.createShoppingListItem)
);

// PUT - Admin and manager can update shopping list items
router.put(
    "/shopping-list/:id",
    requireRole("admin", "manager"),
    asyncHandler(shoppingListController.updateShoppingListItem)
);

// DELETE - Admin can delete shopping list items
router.delete(
    "/shopping-list/:id",
    requireRole("admin"),
    asyncHandler(shoppingListController.deleteShoppingListItem)
);

module.exports = router;