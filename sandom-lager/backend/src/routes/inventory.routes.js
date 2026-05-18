/*
    * inventory.routes.js
    * Routes for inventory item management endpoints.
    * Author: Andreas Skaarberg
*/
const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");

const { checkJwt } = require("../middleware/checkJwt");
const { syncUser } = require("../middleware/syncUser");
const { requireRole } = require("../middleware/requireRole");

const inventoryController = require("../controllers/inventory.controller");

// Apply authentication and user synchronization middleware to all routes in this router
router.use(checkJwt())
router.use(syncUser)

// GET - All users can read inventory
router.get(
    "/inventory",
    requireRole("user", "manager", "admin"), // All roles can access
    asyncHandler(inventoryController.getInventory)
);

// POST - Admin and manager can create inventory items
router.post(
    "/inventory",
    requireRole("admin", "manager"),
    asyncHandler(inventoryController.createInventory)
);

// PUT - Admin and manager can update inventory items
router.put(
    "/inventory/:id",
    requireRole("admin", "manager"),
    asyncHandler(inventoryController.updateInventory)
);

// DELETE - Admin can delete inventory items
router.delete(
    "/inventory/:id",
    requireRole("admin"),
    asyncHandler(inventoryController.deleteInventory)
);

module.exports = router;