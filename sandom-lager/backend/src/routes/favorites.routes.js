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

router.get(
    "/user/favorites",
    requireRole("user", "manager", "admin"),
    asyncHandler(favoritesController.getUserFavorites)
);

router.post(
    "/user/favorites/:inventoryId",
    requireRole("user", "manager", "admin"),
    asyncHandler(favoritesController.addFavorite)
);

router.delete(
    "/user/favorites/:inventoryId",
    requireRole("user", "manager", "admin"),
    asyncHandler(favoritesController.removeFavorite)
);

module.exports = router;
