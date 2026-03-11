const pool = require('../db/pool');

async function logAction(user, action) {
    try {

        const message = `${user.name} ${action}`;

        console.log(`[LOG] ${message}`);

        await pool.query(
            `INSERT INTO logs (user_id, action)
             VALUES ($1, $2)`,
            [user.id, message]
        );

    } catch(err) {
        console.error('Logging error:', err);
    }
}

module.exports = {
    logAction
};