const pool = require("../db/pool");

async function createNotification({ userId, type, title, message, locationNickname = null }) {
    const result = await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, location_nickname)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, type, title, message, locationNickname]
    );

    return result.rows[0];
}

async function createLowStockNotifications({ locationId, ingredientName, quantity, locationName }) {
    const approvedUsersResult = await pool.query(
        `SELECT user_id
         FROM user_locations
         WHERE location_id = $1 AND access_status = 'approved'`,
        [locationId]
    );

    if (approvedUsersResult.rows.length === 0) {
        return [];
    }

    const notifications = [];

    for (const row of approvedUsersResult.rows) {
        const result = await pool.query(
            `INSERT INTO notifications (user_id, type, title, message, location_nickname)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                row.user_id,
                "warning",
                "Lav lagerbeholdning",
                `${ingredientName} er nede i ${quantity} på lager${locationName ? ` i ${locationName}` : ""}`,
                "storage",
            ]
        );

        notifications.push(result.rows[0]);
    }

    return notifications;
}

module.exports = {
    createNotification,
    createLowStockNotifications,
};
