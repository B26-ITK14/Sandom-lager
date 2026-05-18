/*
    * locations.routes.js
    * Routes for location-related endpoints.
    * Author: Khalid Osman
*/
const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const { checkJwt } = require("../middleware/checkJwt");
const { syncUser } = require("../middleware/syncUser");
const { getAllLocations } = require("../controllers/locations.controller");

router.get("/locations", checkJwt(), syncUser, asyncHandler(getAllLocations));

module.exports = router;