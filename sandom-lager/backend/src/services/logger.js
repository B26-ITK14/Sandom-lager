const pool = require('../db/pool');

async function logEvent(event_type, message, metadata = null) {
    try{
        await pool.query(
            `INSERT INTO logs (event_type, message, metadata) 
            VALUES ($1, $2, $3)`,
            [event_type, message, metadata]
        )
    }catch(err){
        console.error('Logging error:', err);
    }
}

module.exports = {
    logEvent
}