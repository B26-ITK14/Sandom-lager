const pool = require("../db/pool");

// POST api/user-locations/request - User requests access to a location
async function requestLocationAccess(req, res) {
    try {
        const userId = req.user.id;
        const { location_id } = req.body;

        // Validate required fields
        if (!location_id) {
            return res.status(400).json({ message: "Missing required field: location_id" });
        }

        const result = await pool.query(
            "INSERT INTO user_locations (user_id, location_id) VALUES ($1, $2) RETURNING *",
            [userId, location_id]
        );

        res.status(201).json(result.rows[0]);   

    } catch (err) {
        console.error("requestLocationAccess error:", err);
        res.status(500).json({ message: "Failed to request location access" });
    }
}

// PATCH api/user-locations/:id/approve - Admin approves location access request
async function approveLocationAccess(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "UPDATE user_locations SET access_status = 'approved' WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Location access request not found" });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error("approveLocationAccess error:", err);
        res.status(500).json({ message: "Failed to approve location access" });
    }
}

// PATCH api/user-locations/:id/deny - Admin denies location access request
async function denyLocationAccess(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "UPDATE user_locations SET access_status = 'denied' WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Location access request not found" });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error("denyLocationAccess error:", err);
        res.status(500).json({ message: "Failed to deny location access" });
    }
}

// GET api/user-locations/me - User views their location access status
async function getMyLocationAccess(req, res) {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            "SELECT l.id, l.name, ul.access_status FROM user_locations ul JOIN locations l ON ul.location_id = l.id WHERE ul.user_id = $1",
            [userId]
        );

        res.json(result.rows);

    } catch (err) {
        console.error("getMyLocationAccess error:", err);
        res.status(500).json({ message: "Failed to fetch location access status" });
    }
}

module.exports = {
    requestLocationAccess,
    approveLocationAccess,
    denyLocationAccess,
    getMyLocationAccess
};

