const express = require('express');
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");

const { checkJwt } = require("../middleware/checkJwt");
const { syncUser } = require("../middleware/syncUser");
const { requireRole } = require("../middleware/requireRole");

const userLocationsController = require("../controllers/userLocations.controller");

// Apply authentication and user synchronization middleware to all routes in this router
router.use(checkJwt())
router.use(syncUser)

// POST - User requests access to location
router.post(
    "/user-locations/request",
    asyncHandler(userLocationsController.requestLocationAccess)
);

// PATCH - Admin approves location access request
router.patch(
    "/user-locations/:id/approve",
    requireRole("admin"),
    asyncHandler(userLocationsController.approveLocationAccess)
);

// PATCH - Admin denies location access request
router.patch(
    "/user-locations/:id/deny",
    requireRole("admin"),
    asyncHandler(userLocationsController.denyLocationAccess)
);

// GET - User views their location access status
router.get(
    "/user-locations/me",
    asyncHandler(userLocationsController.getMyLocationAccess)
);

module.exports = router;