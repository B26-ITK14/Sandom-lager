/*
    * session.controller.js
    * Controller for session listing and revocation logic.
    * Author: Emil Berglund
*/
const pool = require("../db/pool");
const ApiError = require("../utils/ApiError");

// GET /me/sessions - Returns all tracked sessions for the current user
async function getSessions(req, res) {
    console.log(`[getSessions] Fetching sessions for user id: ${req.user.id}`);
    const currentSessionId = req.auth?.jti ?? `${req.auth.sub}:${req.auth.iat}`;

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
        is_current: row.id === currentSessionId,
        device: {
            last_ip: row.ip_address,
            last_user_agent: row.user_agent,
        },
    }));

    res.json({ sessions });
}

// DELETE /me/sessions/:sessionId - Removes a tracked session for the current user
async function revokeSession(req, res) {
    const { sessionId } = req.params;
    console.log(`[revokeSession] user id: ${req.user.id}, sessionId: ${sessionId}`);

    const ownSession = await pool.query(
        "SELECT id FROM user_sessions WHERE id = $1 AND user_id = $2 LIMIT 1",
        [sessionId, req.user.id]
    );

    if (ownSession.rowCount === 0) {
        console.warn(`[revokeSession] No session found or access denied, sessionId: ${sessionId}, user: ${req.user.id}`);
        throw new ApiError(403, "Ingen tilgang til denne sesjonen");
    }

    await pool.query(
        `INSERT INTO revoked_sessions (id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (id) DO NOTHING`,
        [sessionId, req.user.id]
    );

    const result = await pool.query(
        "DELETE FROM user_sessions WHERE id = $1 AND user_id = $2",
        [sessionId, req.user.id]
    );

    console.log(`[revokeSession] ${result.rowCount} session row(s) revoked for sessionId ${sessionId}, user id: ${req.user.id}`);
    res.sendStatus(204);
}

// DELETE /me/sessions/others - Force logout from all other devices/sessions
async function revokeOtherSessions(req, res) {
    const currentSessionId = req.auth?.jti ?? `${req.auth.sub}:${req.auth.iat}`;
    console.log(`[revokeOtherSessions] user id: ${req.user.id}, keep current session: ${currentSessionId}`);

    const candidates = await pool.query(
        "SELECT id FROM user_sessions WHERE user_id = $1 AND id <> $2",
        [req.user.id, currentSessionId]
    );

    const ids = candidates.rows.map((row) => row.id);
    if (ids.length === 0) {
        return res.json({ revoked: 0 });
    }

    await pool.query(
        `INSERT INTO revoked_sessions (id, user_id)
         SELECT UNNEST($1::text[]), $2
         ON CONFLICT (id) DO NOTHING`,
        [ids, req.user.id]
    );

    const result = await pool.query(
        "DELETE FROM user_sessions WHERE user_id = $1 AND id <> $2",
        [req.user.id, currentSessionId]
    );

    console.log(`[revokeOtherSessions] Revoked ${result.rowCount} session(s) for user id: ${req.user.id}`);
    res.json({ revoked: result.rowCount });
}

module.exports = { getSessions, revokeSession, revokeOtherSessions };