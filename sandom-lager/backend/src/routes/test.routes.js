const express = require("express");
const router = express.Router();

const { checkJwt } = require("../middleware/checkJwt");

router.get("/test-secure", checkJwt(), (req, res) => {
  res.json({ message: "Secure endpoint works" });
});

module.exports = router;