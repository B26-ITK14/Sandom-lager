/*
    * shoppingList.routes.js
    * Routes for shopping list endpoints.
    * Author: Andreas Skaarberg
*/
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

router.get(
    "/shopping-list/history",
    requireRole("user", "manager", "admin"),
    asyncHandler(shoppingListController.getShoppingListHistory)
);

// POST - Users can create shopping list items (location handled by backend)
router.post(
    "/shopping-list",
    requireRole("user", "manager", "admin"),
    asyncHandler(shoppingListController.createShoppingListItem)
);

// GENERATE - Generate shopping list from selected recipe IDs
router.post(
    "/shopping-list/generate",
    requireRole("user", "manager", "admin"),
    asyncHandler(shoppingListController.generateShoppingList)
);

// PUT - Users can update shopping list items in their location
router.put(
    "/shopping-list/:id",
    requireRole("user", "manager", "admin"),
    asyncHandler(shoppingListController.updateShoppingListItem)
);

// DELETE - Users can delete shopping list items from their location
router.delete(
    "/shopping-list/:id",
    requireRole("user", "manager", "admin"),
    asyncHandler(shoppingListController.deleteShoppingListItem)
);

// DELETE ALL - Manager/admin can delete entire shopping list for their location
router.delete(
    "/shopping-list",
    requireRole("manager", "admin"),
    asyncHandler(shoppingListController.clearShoppingList)
);

module.exports = router;