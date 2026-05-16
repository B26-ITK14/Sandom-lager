/*
    * auth0Management.js
    * Utility to obtain and cache an Auth0 Management API token and call the API.
    * Author:
*/

let cachedToken = null;
let tokenExpiresAt = 0;

async function getManagementToken() {
    // Return cached token if still valid (with 60s buffer)
    if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
        return cachedToken;
    }

    const { AUTH0_DOMAIN, AUTH0_M2M_CLIENT_ID, AUTH0_M2M_CLIENT_SECRET } = process.env;

    if (!AUTH0_DOMAIN || !AUTH0_M2M_CLIENT_ID || !AUTH0_M2M_CLIENT_SECRET) {
        throw new Error(
            "AUTH0_DOMAIN, AUTH0_M2M_CLIENT_ID and AUTH0_M2M_CLIENT_SECRET must be set"
        );
    }

    const response = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            grant_type: "client_credentials",
            client_id: AUTH0_M2M_CLIENT_ID,
            client_secret: AUTH0_M2M_CLIENT_SECRET,
            audience: `https://${AUTH0_DOMAIN}/api/v2/`,
        }),
    });

    if (!response.ok) {
        throw new Error(`Failed to get Management API token: ${response.status}`);
    }

    const data = await response.json();
    cachedToken = data.access_token;
    tokenExpiresAt = Date.now() + data.expires_in * 1000;

    return cachedToken;
}

/**
 * Call the Auth0 Management API v2.
 * @param {string} path  – path after /api/v2, e.g. "/users/auth0|123/sessions"
 * @param {RequestInit} options – fetch options (method, body, etc.)
 */
async function callManagementApi(path, options = {}) {
    const token = await getManagementToken();
    const { AUTH0_DOMAIN } = process.env;

    const response = await fetch(`https://${AUTH0_DOMAIN}/api/v2${path}`, {
        ...options,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Management API error ${response.status}: ${body}`);
    }

    // DELETE returns 204 with no body
    if (response.status === 204) return null;

    return response.json();
}

module.exports = { callManagementApi };
