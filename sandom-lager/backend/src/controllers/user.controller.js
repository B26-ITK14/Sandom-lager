const pool = require("../db/pool");
const { callManagementApi } = require("../lib/auth0Management");

// GET /me - Returns the current authenticated user's profile
async function getMe(req, res) {
    console.log(`[getMe] user id: ${req.user.id}, role: ${req.user.role}`);
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
    });
}

// PATCH /me/name - Updates the user's display name in the DB and syncs to Auth0
async function updateName(req, res) {
    const { name } = req.body;
    console.log(`[updateName] user id: ${req.user.id}, requested name: "${name}"`);

    if (!name || typeof name !== "string" || !name.trim()) {
        console.warn('[updateName] Validation failed: name is empty or invalid');
        return res.status(400).json({ message: "Navn er påkrevd" });
    }

    const trimmed = name.trim();

    try {
        await pool.query("UPDATE users SET name = $1 WHERE id = $2", [trimmed, req.user.id]);
        console.log(`[updateName] DB updated for user id: ${req.user.id}`);

        try {
            await callManagementApi(`/users/${encodeURIComponent(req.auth.sub)}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: trimmed }),
            });
            console.log(`[updateName] Auth0 Management API synced for sub: ${req.auth.sub}`);
        } catch (mgmtErr) {
            console.warn(`[updateName] Auth0 Management API sync skipped (non-fatal):`, mgmtErr.message);
        }

        res.json({ name: trimmed });
    } catch (err) {
        console.error("[updateName] error:", err.message);
        res.status(500).json({ message: "Kunne ikke oppdatere navn" });
    }
}

// GET /me/sessions - Returns all tracked sessions for the current user
async function getSessions(req, res) {
    console.log(`[getSessions] Fetching sessions for user id: ${req.user.id}`);
    try {
        const result = await pool.query(
            `SELECT id, ip_address, user_agent, created_at, last_seen_at
             FROM user_sessions
             WHERE user_id = $1
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
        const result = await pool.query(
            "DELETE FROM user_sessions WHERE id = $1 AND user_id = $2",
            [sessionId, req.user.id]
        );
        if (result.rowCount === 0) {
            console.warn(`[revokeSession] No session found or access denied — sessionId: ${sessionId}, user: ${req.user.id}`);
            return res.status(403).json({ message: "Ingen tilgang til denne sesjonen" });
        }
        console.log(`[revokeSession] Session ${sessionId} revoked for user id: ${req.user.id}`);
        res.sendStatus(204);
    } catch (err) {
        console.error("[revokeSession] error:", err.message);
        res.status(500).json({ message: "Kunne ikke slette sesjon" });
    }
}

// PATCH /me/email - Changes the email via Auth0 Management API (auth0| accounts only)
async function updateEmail(req, res) {
    const { email } = req.body;
    console.log(`[updateEmail] user id: ${req.user.id}, requested email: "${email}"`);

    if (!email || typeof email !== "string") {
        console.warn('[updateEmail] Validation failed: email missing or invalid type');
        return res.status(400).json({ message: "E-post er påkrevd" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        console.warn(`[updateEmail] Validation failed: bad email format "${email}"`);
        return res.status(400).json({ message: "Ugyldig e-postformat" });
    }

    const auth0Id = req.auth.sub;
    if (!auth0Id.startsWith("auth0|")) {
        console.warn(`[updateEmail] Rejected: sub "${auth0Id}" is not a username/password account`);
        return res.status(400).json({ message: "E-post kan kun endres for brukernavn/passord-kontoer" });
    }
    console.log(`[updateEmail] Calling Management API for sub: ${auth0Id}`);

    try {
        await callManagementApi(`/users/${encodeURIComponent(auth0Id)}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email,
                email_verified: false,
                connection: "Username-Password-Authentication",
            }),
        });

        await callManagementApi("/jobs/verification-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: auth0Id }),
        });

        await pool.query("UPDATE users SET email = $1 WHERE id = $2", [email, req.user.id]);
        console.log(`[updateEmail] DB + Auth0 updated for user id: ${req.user.id} → ${email}`);

        res.json({ message: "E-post oppdatert. Sjekk innboksen din for å bekrefte den nye adressen." });
    } catch (err) {
        console.error("[updateEmail] error:", err.message);
        res.status(500).json({ message: "Kunne ikke oppdatere e-post" });
    }
}

module.exports = { getMe, updateName, getSessions, revokeSession, updateEmail };
