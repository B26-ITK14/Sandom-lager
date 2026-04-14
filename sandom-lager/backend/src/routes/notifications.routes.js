const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");

const { checkJwt } = require("../middleware/checkJwt");
const { syncUser } = require("../middleware/syncUser");
const { requireRole } = require("../middleware/requireRole");

const notificationsController = require("../controllers/notifications.controller");

router.use(checkJwt());
router.use(syncUser);

router.get(
    "/notifications",
    requireRole("user", "manager", "admin"),
    asyncHandler(notificationsController.getNotifications)
);

router.patch(
    "/notifications/:id/read",
    requireRole("user", "manager", "admin"),
    asyncHandler(notificationsController.markNotificationRead)
);

router.patch(
    "/notifications/read-all",
    requireRole("user", "manager", "admin"),
    asyncHandler(notificationsController.markAllNotificationsRead)
);

module.exports = router;
