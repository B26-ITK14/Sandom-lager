const express = require("express");
const router = express.Router();

const { checkJwt } = require("../middleware/checkJwt");
const { syncUser } = require("../middleware/syncUser");

router.get("/test-secure", 
  checkJwt(),
  syncUser,
  (req, res) => {
  res.json({ 
    message: "Secure endpoint works",
    user: req.user
  });
});

module.exports = router;