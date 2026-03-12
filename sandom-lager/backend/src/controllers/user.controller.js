const pool = require("../db/pool");
const { callManagementApi } = require("../lib/auth0Management");

const MAX_PROFILE_PICTURE_BYTES = 5 * 1024 * 1024;
const PROFILE_PICTURE_PATTERN = /^data:image\/(png|jpeg|jpg|gif|webp);base64,[A-Za-z0-9+/=]+$/;

// GET /me - Returns the current authenticated user's profile
async function getMe(req, res) {
    console.log(`[getMe] user id: ${req.user.id}, role: ${req.user.role}`);
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        profilePicture: req.user.profile_picture || null,
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

// PATCH /me/profile-picture - Stores a base64 image for the current user
async function updateProfilePicture(req, res) {
    const { profilePicture } = req.body;
    console.log(`[updateProfilePicture] user id: ${req.user.id}`);

    if (!profilePicture || typeof profilePicture !== "string") {
        console.warn('[updateProfilePicture] Validation failed: profilePicture missing or invalid type');
        return res.status(400).json({ message: "Profilbildet er påkrevd" });
    }

    if (!PROFILE_PICTURE_PATTERN.test(profilePicture)) {
        console.warn('[updateProfilePicture] Validation failed: unsupported file format');
        return res.status(400).json({ message: "Kun JPG, PNG, GIF og WEBP er tillatt" });
    }

    const base64Payload = profilePicture.split(',')[1] || '';
    const byteSize = Buffer.from(base64Payload, 'base64').length;
    if (byteSize > MAX_PROFILE_PICTURE_BYTES) {
        console.warn(`[updateProfilePicture] Validation failed: file too large (${byteSize} bytes)`);
        return res.status(400).json({ message: "Profilbildet kan maks være 5 MB" });
    }

    try {
        await pool.query("UPDATE users SET profile_picture = $1 WHERE id = $2", [profilePicture, req.user.id]);
        console.log(`[updateProfilePicture] Profile picture updated for user id: ${req.user.id}`);
        res.json({ profilePicture });
    } catch (err) {
        console.error("[updateProfilePicture] error:", err.message);
        res.status(500).json({ message: "Kunne ikke oppdatere profilbildet" });
    }
}

module.exports = { getMe, updateName, getSessions, revokeSession, updateEmail, updateProfilePicture };
