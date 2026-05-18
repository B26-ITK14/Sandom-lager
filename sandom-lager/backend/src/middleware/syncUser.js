/*
    * syncUser.js
    * Middleware to synchronize user information from Auth0 to the database and attach user to the request.
    * Author: Andreas Skaarberg & Emil Berglund
*/
// https://auth0.com/docs/secure/tokens/access-tokens/validate-access-tokens
// https://auth0.com/docs/secure/tokens/json-web-tokens
// https://developer.auth0.com/resources/guides/api/express/basic-authorization

// Middleware to synchronize user information from Auth0 with the database
const pool = require("../db/pool");
const { ensureUserSchema } = require("../db/pool");

async function syncUser(req, res, next) {
    try {
        await ensureUserSchema();

        const auth0Id = req.auth?.sub;

        // The Auth0 ID is crucial for identifying the user in the database
        if (!auth0Id) {
            return res.status(401).json({ message: "Invalid token payload" });
        }

        // Check if the user already exists in the database.
        // For known users we skip the /userinfo call entirely to avoid Auth0
        // rate limits — the DB is the authoritative source for name/email after
        // the first sync, and profile updates go through dedicated endpoints.
        console.log(`[syncUser] Request from auth0Id: ${auth0Id}`);

        let userResult = await pool.query("SELECT * FROM users WHERE auth0_id = $1", [auth0Id]);
        let user = userResult.rows[0];

        if (!user) {
            console.log(`[syncUser] New user detected (${auth0Id}), fetching Auth0 /userinfo to seed DB`);

            // New user: fetch profile from Auth0 to seed the database record.
            const authHeader = req.headers.authorization;
            const token = authHeader?.split(" ")[1];

            if (!token) {
                console.warn('[syncUser] Missing access token in Authorization header');
                return res.status(401).json({ message: "Missing access token" });
            }

            const domain = process.env.AUTH0_DOMAIN;
            const userInfoResponse = await fetch(`https://${domain}/userinfo`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!userInfoResponse.ok) {
                console.error(`[syncUser] /userinfo returned ${userInfoResponse.status}`);
                return res.status(401).json({ message: "Failed to fetch user info from Auth0" });
            }

            const profile = await userInfoResponse.json();
            const email = profile.email;
            const name = profile.name || profile.nickname || null;
            const profilePicture = profile.picture || null;

            console.log(`[syncUser] Auth0 profile fetched → email: ${email}, name: ${name}`);

            if (!email) {
                console.error('[syncUser] Email missing from Auth0 profile');
                return res.status(400).json({ message: "Email missing from user profile" });
            }

            const insertResult = await pool.query(
                "INSERT INTO users (auth0_id, email, name, profile_picture, role) VALUES ($1, $2, $3, $4, 'user') RETURNING *",
                [auth0Id, email, name, profilePicture]
            );
            user = insertResult.rows[0];
            console.log(`[syncUser] New user created → id: ${user.id}, role: ${user.role}`);
        } else {
            console.log(`[syncUser] Existing user found → id: ${user.id}, role: ${user.role} (skipping /userinfo)`);
        }

        // Attach user information to the request object
        req.user = user;

        // Track the session by JWT ID (jti) so we can list active sessions without the Management API.
        // Auth0 access tokens do not always include a jti claim, so fall back to a
        // deterministic id built from sub + iat — unique per issued token (per login).
        const jti = req.auth?.jti ?? `${req.auth.sub}:${req.auth.iat}`;

        if (jti) {
            const revokedCheck = await pool.query(
                "SELECT 1 FROM revoked_sessions WHERE id = $1 AND user_id = $2 LIMIT 1",
                [jti, user.id]
            );
            if (revokedCheck.rows.length > 0) {
                console.warn(`[syncUser] Revoked session attempted access jti: ${jti}, user id: ${user.id}`);
                return res.status(401).json({ message: "Sesjonen er avsluttet. Logg inn på nytt." });
            }
        }

        if (jti) {
            const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || null;
            const ua = req.headers['user-agent'] || null;
            console.log(`[syncUser] Upserting session jti: ${jti}, ip: ${ip}`);
            await pool.query(
                `INSERT INTO user_sessions (id, user_id, ip_address, user_agent, created_at, last_seen_at)
                 VALUES ($1, $2, $3, $4, NOW(), NOW())
                 ON CONFLICT (id) DO UPDATE SET last_seen_at = NOW()`,
                [jti, user.id, ip, ua]
            );
        }

        console.log(`[syncUser] Done — proceeding to next middleware for ${req.method} ${req.path}`);
        next();
    } catch (err) {
        console.error("[syncUser] Unexpected error", {
            method: req.method,
            path: req.originalUrl,
            authSub: req.auth?.sub,
            code: err.code,
            message: err.message,
            detail: err.detail,
            stack: err.stack,
        });

        if (err?.code === "42P01") {
            console.error("[syncUser] Hint: one or more database tables are missing. Ensure backend/src/db/schema.sql has been applied to the Render DATABASE_URL database.");
        }

        res.status(500).json({ message: "User sync failed" });
    }
}

module.exports = { syncUser };