const express = require("express");
const router = express.Router();

const { checkJwt } = require("../middleware/checkJwt");
const { syncUser } = require("../middleware/syncUser");
const uploadProfilePicture = require("../middleware/uploadProfilePicture");
const userController = require("../controllers/user.controller");
const sessionController = require("../controllers/session.controller");

function logProfilePictureRequest(req, res, next) {
	const startedAt = Date.now();
	console.log(`[profile-picture-route] start user=${req.user?.id || "unknown"} content-type=${req.headers["content-type"] || "n/a"} content-length=${req.headers["content-length"] || "n/a"}`);

	res.on("finish", () => {
		console.log(`[profile-picture-route] finish status=${res.statusCode} durationMs=${Date.now() - startedAt}`);
	});

	next();
}

function uploadProfilePictureWithLogging(req, res, next) {
	const startedAt = Date.now();
	let settled = false;
	const timeoutMs = 30000;
	const timeout = setTimeout(() => {
		if (settled) return;
		settled = true;
		console.error(`[profile-picture-route] upload middleware timeout after ${timeoutMs}ms`);
		res.status(504).json({ message: "Opplastingen tok for lang tid. Prøv igjen." });
	}, timeoutMs);

	uploadProfilePicture.single("profilePicture")(req, res, (err) => {
		if (settled) return;
		settled = true;
		clearTimeout(timeout);

		if (err) {
			console.error(`[profile-picture-route] multer/cloudinary error after ${Date.now() - startedAt}ms:`, err.message);
			return res.status(400).json({ message: err.message || "Opplasting feilet" });
		}

		const fileSummary = req.file
			? `field=${req.file.fieldname} mime=${req.file.mimetype} bytes=${req.file.size || req.file.buffer?.length || "n/a"} original=${req.file.originalname || "n/a"}`
			: "no-file";
		console.log(`[profile-picture-route] upload middleware done after ${Date.now() - startedAt}ms: ${fileSummary}`);
		next();
	});
}

router.get("/me", checkJwt(), syncUser, userController.getMe);
router.patch("/me/name", checkJwt(), syncUser, userController.updateName);
router.patch("/me/username", checkJwt(), syncUser, userController.updateUsername);
router.patch("/me/profile-picture", checkJwt(), syncUser, logProfilePictureRequest, uploadProfilePictureWithLogging, userController.updateProfilePicture);
router.get("/profile-pictures/:filename", userController.getProfilePicture);
router.get("/me/sessions", checkJwt(), syncUser, sessionController.getSessions);
router.delete("/me/sessions/others", checkJwt(), syncUser, sessionController.revokeOtherSessions);
router.delete("/me/sessions/:sessionId", checkJwt(), syncUser, sessionController.revokeSession);
router.patch("/me/email", checkJwt(), syncUser, userController.updateEmail);

module.exports = router;
