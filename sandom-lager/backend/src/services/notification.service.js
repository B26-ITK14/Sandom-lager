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

module.exports = {
    createNotification,
};
