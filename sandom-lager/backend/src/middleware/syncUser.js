// https://auth0.com/docs/secure/tokens/access-tokens/validate-access-tokens
// https://auth0.com/docs/secure/tokens/json-web-tokens
// https://developer.auth0.com/resources/guides/api/express/basic-authorization

// Middleware to synchronize user information from Auth0 with the database
const pool = require("../db/pool");

async function syncUser(req, res, next) {
    try {
        const auth0Id = req.auth?.sub;
        
        // The Auth0 ID is crucial for identifying the user in the database
        if (!auth0Id) {
            return res.status(401).json({ message: "Invalid token payload" });
        }

        // Get access token from the Authorization header
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(" ")[1];
        
        // Error handling for missing token
        if (!token) {
            return res.status(401).json({ message: "Missing access token" });
        }

        // Fetch user info from Auth0 using the access token
        const domain = process.env.AUTH0_DOMAIN;

        const userInfoResponse = await fetch(`https://${domain}/userinfo`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // Error handling for failed user info fetch
        if (!userInfoResponse.ok) {
            return res.status(401).json({ message: "Failed to fetch user info from Auth0" });
        }

        // Extract user profile information from the response
        const profile = await userInfoResponse.json();
        const email = profile.email;
        const name = profile.name || profile.nickname || null;

        // Email is essential
        if (!email) {
            return res.status(400).json({ message: "Email missing from user profile" });
        }

        // Find user in the database by Auth0 ID
        let userResult = await pool.query("SELECT * FROM users WHERE auth0_id = $1", [auth0Id]);

        let user = userResult.rows[0];

        // If user does not exist, create a new user record
        if (!user) {
            const insertResult = await pool.query(
                "INSERT INTO users (auth0_id, email, name, role) VALUES ($1, $2, $3, 'user') RETURNING *",
                [auth0Id, email, name]
            );

            user = insertResult.rows[0];
        } else {
            // If user exists but email or name has changed, update the database record
            if (user.email !== email || user.name !== name) {
                const updateResult = await pool.query(
                    "UPDATE users SET email = $1, name = $2 WHERE auth0_id = $3 RETURNING *",
                    [email, name, auth0Id]
                );
                user = updateResult.rows[0];
            }
        }

        // Attach user information to the request object
        req.user = user;

        // Track the session by JWT ID (jti) so we can list active sessions without the Management API
        const jti = req.auth?.jti;
        if (jti) {
            const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || null;
            const ua = req.headers['user-agent'] || null;
            await pool.query(
                `INSERT INTO user_sessions (id, user_id, ip_address, user_agent, created_at, last_seen_at)
                 VALUES ($1, $2, $3, $4, NOW(), NOW())
                 ON CONFLICT (id) DO UPDATE SET last_seen_at = NOW()`,
                [jti, user.id, ip, ua]
            );
        }

        next();
    } catch (err) {
        console.error("Error syncing user:", err);
        res.status(500).json({ message: "User sync failed" });
    }
}

module.exports = { syncUser };