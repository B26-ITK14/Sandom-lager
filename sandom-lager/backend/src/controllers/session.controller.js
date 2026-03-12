const pool = require("../db/pool");

// GET /me/sessions - Returns all tracked sessions for the current user
async function getSessions(req, res) {
    console.log(`[getSessions] Fetching sessions for user id: ${req.user.id}`);
    try {
        const result = await pool.query(
            `SELECT * FROM (
               SELECT DISTINCT ON (ip_address, user_agent)
                 id, ip_address, user_agent, created_at, last_seen_at
               FROM user_sessions
               WHERE user_id = $1
               ORDER BY ip_address, user_agent, last_seen_at DESC
             ) deduped
             ORDER BY last_seen_at DESC`,
            [req.user.id]
        );
        console.log(`[getSessions] Found ${result.rows.length} session(s) for user id: ${req.user.id}`);

        const sessions = result.rows.map((row) => ({
            id: row.id,
            created_at: row.created_at,
            updated_at: row.last_seen_at,
            last_interaction_at: row.last_seen_at,
            device: {
                last_ip: row.ip_address,
                last_user_agent: row.user_agent,
            },
        }));

        res.json({ sessions });
    } catch (err) {
        console.error("[getSessions] error:", err.message);
        res.status(500).json({ message: "Kunne ikke hente sesjoner" });
    }
}

// DELETE /me/sessions/:sessionId - Removes a tracked session for the current user
async function revokeSession(req, res) {
    const { sessionId } = req.params;
    console.log(`[revokeSession] user id: ${req.user.id}, sessionId: ${sessionId}`);
    try {
        // Delete all sessions from the same device (same ip+user_agent) as the given session ID
        const result = await pool.query(
            `DELETE FROM user_sessions
             WHERE user_id = $1
               AND ip_address = (SELECT ip_address FROM user_sessions WHERE id = $2 AND user_id = $1)
               AND user_agent  = (SELECT user_agent  FROM user_sessions WHERE id = $2 AND user_id = $1)`,
            [req.user.id, sessionId]
        );
        if (result.rowCount === 0) {
            console.warn(`[revokeSession] No session found or access denied — sessionId: ${sessionId}, user: ${req.user.id}`);
            return res.status(403).json({ message: "Ingen tilgang til denne sesjonen" });
        }
        console.log(`[revokeSession] ${result.rowCount} session row(s) revoked for device of sessionId ${sessionId}, user id: ${req.user.id}`);
        res.sendStatus(204);
    } catch (err) {
        console.error("[revokeSession] error:", err.message);
        res.status(500).json({ message: "Kunne ikke slette sesjon" });
    }
}

module.exports = { getSessions, revokeSession };