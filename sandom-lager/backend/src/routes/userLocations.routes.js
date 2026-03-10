const express = require('express');
const router = express.Router();

const { checkJwt } = require("../middleware/checkJwt");
const { syncUser } = require("../middleware/syncUser");
const { requireRole } = require("../middleware/requireRole");

const {
    requestLocationAccess,
    approveLocationAccess,
    denyLocationAccess,
    getMyLocationAccess, 
} = require("../controllers/userLocations.controller");

// POST - User requests access to location
router.post(
    "/user-locations/request",
    checkJwt(),
    syncUser,
    requestLocationAccess
);

// PATCH - Admin approves location access request
router.patch(
    "/user-locations/:id/approve",
    checkJwt(),
    syncUser,
    requireRole("admin"),
    approveLocationAccess
);

// PATCH - Admin denies location access request
router.patch(
    "/user-locations/:id/deny",
    checkJwt(),
    syncUser,
    requireRole("admin"),
    denyLocationAccess
);

// GET - User views their location access status
router.get(
    "/user-locations/me",
    checkJwt(),
    syncUser,
    getMyLocationAccess
);

module.exports = router;