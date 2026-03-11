const express = require("express");
const router = express.Router();

const pool = require("../db/pool");
const { checkJwt } = require("../middleware/checkJwt");
const { syncUser } = require("../middleware/syncUser");
const { requireRole } = require("../middleware/requireRole");
const { callManagementApi } = require("../lib/auth0Management");

// Use Postman or similar tool to test these endpoints with a valid JWT in the Authorization header
router.get("/test-secure", 
  checkJwt(),
  syncUser,
  (req, res) => {
  res.json({ 
    message: "Secure endpoint works",
    user: req.user
  });
});

// Example of a role-protected route, if role is 'user', this route will be inaccessible
router.get("/test-admin", 
  checkJwt(),
  syncUser,
  requireRole("admin"),
  (req, res) => {
  res.json({ 
    message: "Admin access works",
    user: req.user
  });
});

// Returns the current authenticated user's profile including their role
router.get("/me",
  checkJwt(),
  syncUser,
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    });
  }
);

// Updates the current user's display name in the DB and syncs it to Auth0
router.patch("/me/name",
  checkJwt(),
  syncUser,
  async (req, res) => {
    const { name } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Navn er påkrevd" });
    }

    const trimmed = name.trim();

    try {
      await pool.query("UPDATE users SET name = $1 WHERE id = $2", [trimmed, req.user.id]);

      await callManagementApi(`/users/${encodeURIComponent(req.auth.sub)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      res.json({ name: trimmed });
    } catch (err) {
      console.error("updateName error:", err.message);
      res.status(500).json({ message: "Kunne ikke oppdatere navn" });
    }
  }
);

// Returns all tracked sessions for the current user, shaped to match the Auth0Session format
router.get("/me/sessions",
  checkJwt(),
  syncUser,
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT id, ip_address, user_agent, created_at, last_seen_at
         FROM user_sessions
         WHERE user_id = $1
         ORDER BY last_seen_at DESC`,
        [req.user.id]
      );

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
      console.error("fetchSessions error:", err.message);
      res.status(500).json({ message: "Kunne ikke hente sesjoner" });
    }
  }
);

// Removes a tracked session for the current user
router.delete("/me/sessions/:sessionId",
  checkJwt(),
  syncUser,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const result = await pool.query(
        "DELETE FROM user_sessions WHERE id = $1 AND user_id = $2",
        [sessionId, req.user.id]
      );
      if (result.rowCount === 0) {
        return res.status(403).json({ message: "Ingen tilgang til denne sesjonen" });
      }
      res.sendStatus(204);
    } catch (err) {
      console.error("revokeSession error:", err.message);
      res.status(500).json({ message: "Kunne ikke slette sesjon" });
    }
  }
);

// Changes the email address of the current user via Auth0 Management API.
// Only supported for username/password (auth0|) accounts.
router.patch("/me/email",
  checkJwt(),
  syncUser,
  async (req, res) => {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "E-post er påkrevd" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Ugyldig e-postformat" });
    }

    const auth0Id = req.auth.sub;
    if (!auth0Id.startsWith("auth0|")) {
      return res.status(400).json({ message: "E-post kan kun endres for brukernavn/passord-kontoer" });
    }

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

      // Explicitly send a verification email to the new address
      await callManagementApi("/jobs/verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: auth0Id }),
      });

      await pool.query("UPDATE users SET email = $1 WHERE id = $2", [email, req.user.id]);

      res.json({ message: "E-post oppdatert. Sjekk innboksen din for å bekrefte den nye adressen." });
    } catch (err) {
      console.error("changeEmail error:", err.message);
      res.status(500).json({ message: "Kunne ikke oppdatere e-post" });
    }
  }
);

// Example of a role-protected route, if role is 'user', this route will be inaccessible
router.get("/test-manager", 
  checkJwt(),
  syncUser,
  requireRole("manager"),
  (req, res) => {
  res.json({ 
    message: "Manager access works",
    user: req.user
  });
});

// Example of a role-protected route, if role is 'user', this route will be accessible
router.get("/test-user", 
  checkJwt(),
  syncUser,
  requireRole("user"),
  (req, res) => {
  res.json({ 
    message: "User access works",
    user: req.user
  });
});



module.exports = router;