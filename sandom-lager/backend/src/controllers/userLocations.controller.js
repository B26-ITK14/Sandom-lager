const pool = require("../db/pool");
const ApiError = require("../utils/ApiError");
const { createNotification } = require("../services/notification.service");

// POST api/user-locations/request - User requests access to a location
async function requestLocationAccess(req, res) {
  
    const userId = req.user.id;
    const { location_id } = req.body;

    // Validate required fields
    if (!location_id) {
        throw new ApiError(400, "Missing required field: location_id");
    }

    const result = await pool.query(
        "INSERT INTO user_locations (user_id, location_id) VALUES ($1, $2) RETURNING *",
        [userId, location_id]
    );

    res.status(201).json(result.rows[0]);   

}

// PATCH api/user-locations/:id/approve - Admin approves location access request
async function approveLocationAccess(req, res) {
    
    const { id } = req.params;

    const result = await pool.query(
        `UPDATE user_locations ul
         SET access_status = 'approved'
         FROM locations l
         WHERE ul.id = $1
         AND ul.location_id = l.id
         RETURNING ul.*, l.name AS location_name`,
        [id]
    );

    if (result.rows.length === 0) {
        throw new ApiError(404, "Location access request not found");
    }

    const approved = result.rows[0];

    await createNotification({
        userId: approved.user_id,
        type: "info",
        title: "Tilgang godkjent",
        message: `Du har fått tilgang til ${approved.location_name}`,
        locationNickname: "settings-applications",
    });

    res.json(approved);
}

// PATCH api/user-locations/:id/deny - Admin denies location access request
async function denyLocationAccess(req, res) {
   
    const { id } = req.params;

    const result = await pool.query(
        `UPDATE user_locations ul
         SET access_status = 'denied'
         FROM locations l
         WHERE ul.id = $1
         AND ul.location_id = l.id
         RETURNING ul.*, l.name AS location_name`,
        [id]
    );

    if (result.rows.length === 0) {
        throw new ApiError(404, "Location access request not found");
    }

    const denied = result.rows[0];

    await createNotification({
        userId: denied.user_id,
        type: "alert",
        title: "Søknad avslått",
        message: `Søknaden din til ${denied.location_name} ble avslått`,
        locationNickname: "settings-applications",
    });

    res.json(denied);
}

// GET api/user-locations/me - User views their location access status
async function getMyLocationAccess(req, res) {
    
    const userId = req.user.id;

    const result = await pool.query(
        `SELECT ul.id,
                ul.location_id,
                l.name AS location_name,
                ul.access_status,
                ul.created_at
         FROM user_locations ul
         JOIN locations l ON ul.location_id = l.id
         WHERE ul.user_id = $1
         ORDER BY ul.created_at DESC`,
        [userId]
    );

    res.json(result.rows);
}

// GET api/user-locations - Admin henter alle tilgangssøknader
async function getAllLocationAccess(req, res) {
    try {
        const result = await pool.query(
            `SELECT ul.id, ul.access_status, ul.created_at,
                    u.name as user_name, u.email,
                    l.name as location_name
             FROM user_locations ul
             JOIN users u ON ul.user_id = u.id
             JOIN locations l ON ul.location_id = l.id
             ORDER BY ul.created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error("getAllLocationAccess error:", err);
        res.status(500).json({ message: "Failed to fetch location access requests" });
    }
}

// PATCH api/user-locations/:id/revoke - Admin revokes location access
async function revokeLocationAccess(req, res) {
    const { id } = req.params;

    const result = await pool.query(
        "UPDATE user_locations SET access_status = 'denied' WHERE id = $1 RETURNING *",
        [id]
    );

    if (result.rows.length === 0) {
        throw new ApiError(404, "Location access request not found");
    }

    res.json(result.rows[0]);
}

// PATCH api/user-locations/:id/block - Admin blocks user in Auth0
async function blockUser(req, res) {
    const { id } = req.params;
    const { callManagementApi } = require("../lib/auth0Management");

    // Hent auth0_id fra databasen via user_locations
    const result = await pool.query(
        `SELECT u.auth0_id FROM user_locations ul
         JOIN users u ON ul.user_id = u.id
         WHERE ul.id = $1`,
        [id]
    );

    if (result.rows.length === 0) {
        throw new ApiError(404, "User not found");
    }

    const auth0Id = result.rows[0].auth0_id;

    await callManagementApi(`/users/${encodeURIComponent(auth0Id)}`, {
        method: "PATCH",
        body: JSON.stringify({ blocked: true }),
    });

    res.json({ message: "User blocked successfully" });
}

module.exports = {
    requestLocationAccess,
    approveLocationAccess,
    denyLocationAccess,
    getMyLocationAccess,
    getAllLocationAccess,
    revokeLocationAccess,
    blockUser
};

