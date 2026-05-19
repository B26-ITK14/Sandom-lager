/*
    * favorites.routes.js
    * Routes for managing user favorites.
    * Author: Ida Tollaksen
*/
const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");
const { checkJwt } = require("../middleware/checkJwt");
const { syncUser } = require("../middleware/syncUser");
const { requireRole } = require("../middleware/requireRole");

const favoritesController = require("../controllers/favorites.controller");

router.use(checkJwt());
router.use(syncUser);

//Get - get all favorites for the current user
// All users allowed
router.get(
    "/user/favorites",
    requireRole("user", "manager", "admin"),
    asyncHandler(favoritesController.getUserFavorites)
);

//Post - add a favorite inventory item for the current user
// All users allowed
router.post(
    "/user/favorites/:inventoryId",
    requireRole("user", "manager", "admin"),
    asyncHandler(favoritesController.addFavorite)
);

//Delete - remove a favorite inventory item for the current user
// All users allowed
router.delete(
    "/user/favorites/:inventoryId",
    requireRole("user", "manager", "admin"),
    asyncHandler(favoritesController.removeFavorite)
);

module.exports = router;
