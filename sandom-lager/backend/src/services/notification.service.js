/**
 * notification.service.js
 * Service for creating notifications in the system. This includes both user-initiated notifications (e.g. admin approving location access) 
 * and system-generated notifications (e.g. low stock alerts).
 */

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
    const locationSuffix = locationName ? ` i ${locationName}` : "";
    const newMessage = `Følgende varer har lav beholdning${locationSuffix}: ${ingredientName}.`;

    for (const row of approvedUsersResult.rows) {
        const existingUnreadResult = await pool.query(
            `SELECT id, message
             FROM notifications
             WHERE user_id = $1
               AND type = 'warning'
               AND title = 'Lav lagerbeholdning'
               AND location_nickname = 'storage'
               AND is_read = FALSE
                             AND message LIKE $2
             ORDER BY created_at DESC
             LIMIT 1`,
                        [row.user_id, `%Følgende varer har lav beholdning${locationSuffix}%`]
        );

        if (existingUnreadResult.rows.length > 0) {
            const existingNotification = existingUnreadResult.rows[0];
                        const existingIngredients = existingNotification.message
                                .split(": ")
                                .pop()
                                ?.replace(/\.$/, "")
                                .split(", ")
                                .map((item) => item.trim())
                                .filter(Boolean) ?? [];

                        const mergedIngredients = Array.from(new Set([...existingIngredients, ingredientName]));
                        const mergedMessage = `Følgende varer har lav beholdning${locationSuffix}: ${mergedIngredients.join(", ")}.`;

            const result = await pool.query(
                `UPDATE notifications
                 SET message = $2,
                     created_at = NOW()
                 WHERE id = $1
                 RETURNING *`,
                [existingNotification.id, mergedMessage]
            );

            notifications.push(result.rows[0]);
            continue;
        }

        const result = await pool.query(
            `INSERT INTO notifications (user_id, type, title, message, location_nickname)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                row.user_id,
                "warning",
                "Lav lagerbeholdning",
                newMessage,
                "storage",
            ]
        );

        notifications.push(result.rows[0]);
    }

    return notifications;
}

async function createAdminAccessRequestNotifications({ requesterName, locationName }) {
    const adminsResult = await pool.query(
        `SELECT id
         FROM users
         WHERE role = 'admin'`
    );

    if (adminsResult.rows.length === 0) {
        return [];
    }

    const notifications = [];

    for (const admin of adminsResult.rows) {
        const result = await pool.query(
            `INSERT INTO notifications (user_id, type, title, message, location_nickname)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                admin.id,
                "alert",
                "Ny tilgangssøknad",
                `${requesterName} har søkt om tilgang til ${locationName}`,
                "admin",
            ]
        );

        notifications.push(result.rows[0]);
    }

    return notifications;
}

module.exports = {
    createNotification,
    createLowStockNotifications,
    createAdminAccessRequestNotifications,
};
