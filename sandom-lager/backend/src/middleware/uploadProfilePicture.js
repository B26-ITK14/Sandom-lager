/*
    * uploadProfilePicture.js
    * Middleware to handle profile picture uploads and Cloudinary integration.
    * Author: Emil Berglund
*/
const multer = require('multer');
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Kun JPG, PNG, GIF og WEBP er tillatt'), false);
    }
};

// Create multer instance
const uploadProfilePicture = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
    },
});

module.exports = uploadProfilePicture;
