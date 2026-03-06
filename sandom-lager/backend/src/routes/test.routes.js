const express = require("express");
const router = express.Router();

const { checkJwt } = require("../middleware/checkJwt");
const { syncUser } = require("../middleware/syncUser");
const { requireRole } = require("../middleware/requireRole");

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