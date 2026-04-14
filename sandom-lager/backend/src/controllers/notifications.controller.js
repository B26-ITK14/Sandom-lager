const pool = require("../db/pool");
const ApiError = require("../utils/ApiError");

// GET /api/notifications?unreadOnly=true
async function getNotifications(req, res) {
    const userId = req.user.id;
    const unreadOnly = String(req.query.unreadOnly || "").toLowerCase() === "true";

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

module.exports = {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
};

