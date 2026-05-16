/*
    * logger.js
    * Logging utility that records actions to the console and database.
    * Author:
*/
const pool = require('../db/pool');

async function logAction(user, action) {
    try {
        const message = `${user.name} ${action}`;

        //Format time for logging
        const timestamp = new Date().toLocaleString('no-NO')

        console.log(`[LOG] [${timestamp}] ${message}`);

        await pool.query(
            `INSERT INTO logs (user_id, action)
             VALUES ($1, $2)`,
            [user.id, message]
        );

    } catch (err) {
        console.error('Logging error:', err);
    }
}

module.exports = {
    logAction
};