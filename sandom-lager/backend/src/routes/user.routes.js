const express = require("express");
const router = express.Router();

const { checkJwt } = require("../middleware/checkJwt");
const { syncUser } = require("../middleware/syncUser");
const userController = require("../controllers/user.controller");

router.get("/me", checkJwt(), syncUser, userController.getMe);
router.patch("/me/name", checkJwt(), syncUser, userController.updateName);
router.patch("/me/profile-picture", checkJwt(), syncUser, userController.updateProfilePicture);
router.get("/me/sessions", checkJwt(), syncUser, userController.getSessions);
router.delete("/me/sessions/:sessionId", checkJwt(), syncUser, userController.revokeSession);
router.patch("/me/email", checkJwt(), syncUser, userController.updateEmail);

module.exports = router;
