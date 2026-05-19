/*
    * notifications.controller.js
    * Controller for creating and managing user notifications.
    * Author: Ida Tollaksen
*/
const pool = require("../db/pool");
const ApiError = require("../utils/ApiError");
const { createAdminAccessRequestNotifications } = require("../services/notification.service");

// GET /api/notifications?unreadOnly=true
async function getNotifications(req, res) {
    const userId = req.user.id;
    const unreadOnly = String(req.query.unreadOnly || "").toLowerCase() === "true";

    res.set("Cache-Control", "no-store");

    const params = [userId];
    let whereClause = "WHERE user_id = $1";

    if (unreadOnly) {
        whereClause += " AND is_read = FALSE";
    }

    const result = await pool.query(
        `SELECT
            id,
            type,
            title,
            message,
            location_nickname,
            is_read,
            created_at
         FROM notifications
         ${whereClause}
         ORDER BY created_at DESC`,
        params
    );

    res.json(result.rows);
}

// PATCH /api/notifications/:id/read
async function markNotificationRead(req, res) {
    const userId = req.user.id;
    const notificationId = Number(req.params.id);

    if (!Number.isFinite(notificationId)) {
        throw new ApiError(400, "Invalid notification id");
    }

    const result = await pool.query(
        `UPDATE notifications
         SET is_read = TRUE
         WHERE id = $1 AND user_id = $2
         RETURNING id, is_read`,
        [notificationId, userId]
    );

    if (result.rows.length === 0) {
        throw new ApiError(404, "Notification not found");
    }

    res.json(result.rows[0]);
}

// PATCH /api/notifications/read-all
async function markAllNotificationsRead(req, res) {
    const userId = req.user.id;

    const result = await pool.query(
        `UPDATE notifications
         SET is_read = TRUE
         WHERE user_id = $1 AND is_read = FALSE`,
        [userId]
    );

    res.json({
        message: "All notifications marked as read",
        updatedCount: result.rowCount || 0,
    });
}

// DELETE /api/notifications/:id
async function deleteNotification(req, res) {
    const userId = req.user.id;
    const notificationId = Number(req.params.id);

    if (!Number.isFinite(notificationId)) {
        throw new ApiError(400, "Invalid notification id");
    }

    const result = await pool.query(
        `DELETE FROM notifications
         WHERE id = $1 AND user_id = $2
         RETURNING id`,
        [notificationId, userId]
    );

    if (result.rows.length === 0) {
        throw new ApiError(404, "Notification not found");
    }

    res.json({ message: "Notification deleted", id: result.rows[0].id });
}

// POST /api/notifications/access-request
async function notifyAdminsOfAccessRequest(req, res) {
    const requesterId = req.user.id;
    const { location_id } = req.body;

    if (!location_id) {
        throw new ApiError(400, "Missing required field: location_id");
    }

    const requestDetailsResult = await pool.query(
        `SELECT u.name AS user_name, l.name AS location_name
         FROM users u
         JOIN locations l ON l.id = $1
         WHERE u.id = $2`,
        [location_id, requesterId]
    );

    if (requestDetailsResult.rows.length === 0) {
        throw new ApiError(404, "Could not resolve access request details");
    }

    const requestDetails = requestDetailsResult.rows[0];

    const notifications = await createAdminAccessRequestNotifications({
        requesterName: requestDetails.user_name,
        locationName: requestDetails.location_name,
    });

    res.status(201).json({
        message: "Admin notifications created",
        count: notifications.length,
    });
}

module.exports = {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    notifyAdminsOfAccessRequest,
};

