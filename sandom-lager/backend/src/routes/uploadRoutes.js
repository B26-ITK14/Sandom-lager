/*
    * uploadRoutes.js
    * Routes for file uploads and profile picture endpoints.
    * Author: Emil Berglund
*/
const express = require("express");
const multer = require("multer");
const {
    uploadProfilePictureBuffer,
    uploadRecipeImageBuffer,
    toCloudinaryUrl,
} = require("../lib/cloudinaryUploads");
const { checkJwt } = require("../middleware/checkJwt");
const { syncUser } = require("../middleware/syncUser");
const { requireRole } = require("../middleware/requireRole");

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 8 * 1024 * 1024,
    },
});

function withSingleImage(req, res, next) {
    upload.single("image")(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message || "Upload failed" });
        }

        if (!req.file) {
            return res.status(400).json({ error: "Image is required" });
        }

        next();
    });
}

router.post("/upload/profile-picture", checkJwt(), syncUser, requireRole("user", "manager", "admin"), withSingleImage, async (req, res) => {
    try {
        const publicId = await uploadProfilePictureBuffer({
            userId: req.user?.id,
            buffer: req.file.buffer,
            mimetype: req.file.mimetype,
        });

        res.json({
            publicId,
            url: toCloudinaryUrl(publicId),
            type: "profile-picture",
        });
    } catch (err) {
        res.status(500).json({ error: "Upload failed" });
    }
});

router.post("/upload/recipe-image", checkJwt(), syncUser, requireRole("manager", "admin"), withSingleImage, async (req, res) => {
    try {
        const recipeId = req.body?.recipeId;
        const publicId = await uploadRecipeImageBuffer({
            recipeId,
            buffer: req.file.buffer,
            mimetype: req.file.mimetype,
        });

        res.json({
            publicId,
            url: toCloudinaryUrl(publicId),
            type: "recipe-image",
        });
    } catch (err) {
        res.status(500).json({ error: "Upload failed" });
    }
});

module.exports = router;