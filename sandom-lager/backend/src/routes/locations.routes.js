/*
    * locations.routes.js
    * Routes for location-related endpoints.
    * Author:
*/
const express = require("express");
const router = express.Router();
const { checkJwt } = require("../middleware/checkJwt");
const { syncUser } = require("../middleware/syncUser");
const { getAllLocations } = require("../controllers/locations.controller");

router.get("/locations", checkJwt(), syncUser, getAllLocations);

module.exports = router;