/*
    * notifications.routes.js
    * Routes for notifications endpoints and actions.
    * Author: Ida Tollaksen
*/
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

router.delete(
    "/notifications/:id",
    requireRole("user", "manager", "admin"),
    asyncHandler(notificationsController.deleteNotification)
);

router.patch(
    "/notifications/read-all",
    requireRole("user", "manager", "admin"),
    asyncHandler(notificationsController.markAllNotificationsRead)
);

router.post(
    "/notifications/access-request",
    requireRole("user", "manager", "admin"),
    asyncHandler(notificationsController.notifyAdminsOfAccessRequest)
);

module.exports = router;
