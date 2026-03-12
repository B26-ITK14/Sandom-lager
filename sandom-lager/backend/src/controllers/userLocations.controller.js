const pool = require("../db/pool");
const ApiError = require("../utils/ApiError");

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
        "UPDATE user_locations SET access_status = 'approved' WHERE id = $1 RETURNING *",
        [id]
    );

    if (result.rows.length === 0) {
        throw new ApiError(404, "Location access request not found");
    }

    res.json(result.rows[0]);
}

// PATCH api/user-locations/:id/deny - Admin denies location access request
async function denyLocationAccess(req, res) {
   
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

// GET api/user-locations/me - User views their location access status
async function getMyLocationAccess(req, res) {
    
    const userId = req.user.id;

    const result = await pool.query(
        "SELECT l.id, l.name, ul.access_status FROM user_locations ul JOIN locations l ON ul.location_id = l.id WHERE ul.user_id = $1",
        [userId]
    );

    res.json(result.rows);
}

module.exports = {
    requestLocationAccess,
    approveLocationAccess,
    denyLocationAccess,
    getMyLocationAccess
};

