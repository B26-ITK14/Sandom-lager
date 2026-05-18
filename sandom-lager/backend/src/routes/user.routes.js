/*
	* user.routes.js
	* Routes for user profile and account management.
	* Author: Emil Berglund
*/
const express = require("express");
const router = express.Router();

const { checkJwt } = require("../middleware/checkJwt");
const { syncUser } = require("../middleware/syncUser");
const uploadProfilePicture = require("../middleware/uploadProfilePicture");
const userController = require("../controllers/user.controller");
const sessionController = require("../controllers/session.controller");

function uploadProfilePictureWithLogging(req, res, next) {
	let settled = false;
	const timeoutMs = 30000;
	const timeout = setTimeout(() => {
		if (settled) return;
		settled = true;
		res.status(504).json({ message: "Opplastingen tok for lang tid. Prøv igjen." });
	}, timeoutMs);

	uploadProfilePicture.single("profilePicture")(req, res, (err) => {
		if (settled) return;
		settled = true;
		clearTimeout(timeout);

		if (err) {
			return res.status(400).json({ message: err.message || "Opplasting feilet" });
		}

		next();
	});
}

router.get("/me", checkJwt(), syncUser, userController.getMe);
router.patch("/me/name", checkJwt(), syncUser, userController.updateName);
router.patch("/me/username", checkJwt(), syncUser, userController.updateUsername);
router.patch("/me/profile-picture", checkJwt(), syncUser, uploadProfilePictureWithLogging, userController.updateProfilePicture);
router.patch("/me/notification-preferences", checkJwt(), syncUser, userController.updateNotificationPreferences);
router.get("/profile-pictures/:filename", userController.getProfilePicture);
router.get("/me/sessions", checkJwt(), syncUser, sessionController.getSessions);
router.delete("/me/sessions/others", checkJwt(), syncUser, sessionController.revokeOtherSessions);
router.delete("/me/sessions/:sessionId", checkJwt(), syncUser, sessionController.revokeSession);
router.patch("/me/email", checkJwt(), syncUser, userController.updateEmail);

module.exports = router;
