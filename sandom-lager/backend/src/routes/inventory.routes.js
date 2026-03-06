const express = require("express");
const router = express.Router();

const { checkJwt } = require("../middleware/checkJwt");
const { syncUser } = require("../middleware/syncUser");
const { requireRole } = require("../middleware/requireRole");

const { getInventory, createInventory, updateInventory, deleteInventory } = require("../controllers/inventory.controller");

// GET - All users can read inventory
router.get(
    "/inventory", 
    checkJwt(),
    requireRole("user"),
    syncUser,
    getInventory
);

// POST - Admin and manager can create inventory items
router.post(
    "/inventory",
    checkJwt(),
    syncUser,
    requireRole("admin", "manager"),
    createInventory
);

// PUT - Admin and manager can update inventory items
router.put(
    "/inventory/:id",
    checkJwt(),
    syncUser,
    requireRole("admin", "manager"),
    updateInventory
);

// DELETE - Admin can delete inventory items
router.delete(
    "/inventory/:id",
    checkJwt(),
    syncUser,
    requireRole("admin"),
    deleteInventory
);

module.exports = router;