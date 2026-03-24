const pool = require("../db/pool");
const { callManagementApi } = require("../lib/auth0Management");
const fs = require('fs');
const path = require('path');

const MAX_PROFILE_PICTURE_BYTES = 5 * 1024 * 1024;
const PROFILE_PICTURE_PATTERN = /^data:image\/(png|jpeg|jpg|gif|webp);base64,[A-Za-z0-9+/=]+$/;
const uploadsDir = path.join(__dirname, '../../uploads/profile-pictures');

// GET /me - Returns the current authenticated user's profile
async function getMe(req, res) {
    try {
        const result = await pool.query(
            "SELECT id, name, email, username, role, profile_picture FROM users WHERE id = $1",
            [req.user.id]
        );

        const user = result.rows[0];
        if (!user) {
            return res.status(404).json({ message: "Bruker ikke funnet" });
        }

        // Convert filename to full API URL if profile picture exists
        const profilePictureUrl = user.profile_picture 
            ? `/api/profile-pictures/${user.profile_picture}`
            : null;

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username || null,
            role: user.role,
            profilePicture: profilePictureUrl,
        });
    } catch (err) {
        console.error("[getMe] error:", err.message);
        res.status(500).json({ message: "Kunne ikke hente brukerprofil" });
    }
}

// PATCH /me/username - Updates the user's username in DB and Auth0
async function updateUsername(req, res) {
    const { username } = req.body;
    console.log(`[updateUsername] user id: ${req.user.id}, requested username: "${username}"`);

    if (!username || typeof username !== "string") {
        console.warn('[updateUsername] Validation failed: username missing or invalid type');
        return res.status(400).json({ message: "Brukernavn er påkrevd" });
    }

    const trimmed = username.trim();
    if (trimmed.length < 3 || trimmed.length > 30) {
        console.warn(`[updateUsername] Validation failed: invalid length (${trimmed.length})`);
        return res.status(400).json({ message: "Brukernavn må være mellom 3 og 30 tegn" });
    }

    if (!/^[A-Za-z0-9._-]+$/.test(trimmed)) {
        console.warn('[updateUsername] Validation failed: invalid characters');
        return res.status(400).json({ message: "Brukernavn kan kun inneholde bokstaver, tall, punktum, bindestrek og understrek" });
    }

    const auth0Id = req.auth?.sub;
    if (!auth0Id?.startsWith("auth0|")) {
        console.warn(`[updateUsername] Rejected: sub "${auth0Id}" is not a username/password account`);
        return res.status(400).json({ message: "Brukernavn kan kun endres for brukernavn/passord-kontoer" });
    }

    try {
        const takenResult = await pool.query(
            "SELECT id FROM users WHERE LOWER(username) = LOWER($1) AND id <> $2 LIMIT 1",
            [trimmed, req.user.id]
        );

        if (takenResult.rows.length > 0) {
            console.warn(`[updateUsername] Username already taken: ${trimmed}`);
            return res.status(409).json({ message: "Brukernavnet er allerede tatt. Velg et annet brukernavn." });
        }

        await callManagementApi(`/users/${encodeURIComponent(auth0Id)}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: trimmed }),
        });
        console.log(`[updateUsername] Auth0 Management API synced for sub: ${auth0Id}`);

        const updateResult = await pool.query(
            "UPDATE users SET username = $1 WHERE id = $2 RETURNING username",
            [trimmed, req.user.id]
        );

        res.json({ username: updateResult.rows[0]?.username || null });
    } catch (err) {
        if (err && err.code === "23505") {
            console.warn(`[updateUsername] Unique constraint violation for username: ${trimmed}`);
            return res.status(409).json({ message: "Brukernavnet er allerede tatt. Velg et annet brukernavn." });
        }
        if (err instanceof Error && err.message.includes("Management API error")) {
            console.error("[updateUsername] Auth0 sync failed:", err.message);
            return res.status(502).json({ message: "Kunne ikke oppdatere brukernavn i Auth0" });
        }
        console.error("[updateUsername] error:", err.message);
        res.status(500).json({ message: "Kunne ikke oppdatere brukernavn" });
    }
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

// PATCH /me/profile-picture - Stores the uploaded profile picture for the current user
async function updateProfilePicture(req, res) {
    console.log(`[updateProfilePicture] user id: ${req.user.id}`);

    if (!req.file) {
        console.warn('[updateProfilePicture] Validation failed: no file uploaded');
        return res.status(400).json({ message: "Profilbildet er påkrevd" });
    }

    try {
        // Get the old profile picture filename to delete it
        const oldResult = await pool.query(
            "SELECT profile_picture FROM users WHERE id = $1",
            [req.user.id]
        );

        const oldFilename = oldResult.rows[0]?.profile_picture;

        // Delete old file if it exists
        if (oldFilename && oldFilename !== 'default') {
            const oldFilePath = path.join(uploadsDir, oldFilename);
            try {
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                    console.log(`[updateProfilePicture] Deleted old file: ${oldFilename}`);
                }
            } catch (err) {
                console.warn(`[updateProfilePicture] Failed to delete old file: ${err.message}`);
                // Don't fail the request if cleanup fails
            }
        }

        // Save the filename to database
        const filename = req.file.filename;
        const result = await pool.query(
            "UPDATE users SET profile_picture = $1 WHERE id = $2 RETURNING profile_picture",
            [filename, req.user.id]
        );

        console.log(`[updateProfilePicture] Profile picture updated for user id: ${req.user.id}, file: ${filename}`);
        
        res.json({ 
            profilePicture: `/api/profile-pictures/${result.rows[0]?.profile_picture}` || null 
        });
    } catch (err) {
        // Clean up uploaded file on error
        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.error("[updateProfilePicture] error:", err.message);
        res.status(500).json({ message: "Kunne ikke oppdatere profilbildet" });
    }
}

// GET /profile-pictures/:filename - Serves the profile picture
async function getProfilePicture(req, res) {
    const { filename } = req.params;

    // Validate filename to prevent directory traversal
    if (!filename || /[/\\]/.test(filename)) {
        return res.status(400).json({ message: "Ugyldig bildenavn" });
    }

    const filePath = path.join(uploadsDir, filename);

    // Ensure the file is within the uploads directory
    if (!filePath.startsWith(uploadsDir)) {
        return res.status(403).json({ message: "Tilgang nektet" });
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Bildet ikke funnet" });
    }

    try {
        // Set cache headers
        res.set('Cache-Control', 'public, max-age=604800'); // 1 week
        res.sendFile(filePath);
    } catch (err) {
        console.error("[getProfilePicture] error:", err.message);
        res.status(500).json({ message: "Kunne ikke hente bildet" });
    }
}

module.exports = {
    getMe,
    updateName,
    updateEmail,
    updateProfilePicture,
    getProfilePicture,
    updateUsername,
};
