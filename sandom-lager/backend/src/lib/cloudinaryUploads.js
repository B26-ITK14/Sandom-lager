const cloudinary = require("./cloudinary");
const { CLOUDINARY_FOLDERS } = require("./cloudinaryFolders");

function uploadImageBuffer({ buffer, mimetype, folder, publicIdPrefix, timeoutMs = 25000 }) {
  const publicId = `${publicIdPrefix}-${Date.now()}`;
  const dataUri = `data:${mimetype};base64,${buffer.toString("base64")}`;

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Cloudinary upload timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    cloudinary.uploader.upload(
      dataUri,
      {
        folder,
        public_id: publicId,
        resource_type: "image",
      },
      (err, result) => {
        clearTimeout(timeout);

        if (err) {
          return reject(err);
        }

        if (!result?.public_id) {
          return reject(new Error("Cloudinary upload did not return public_id"));
        }

        return resolve(result.public_id);
      }
    );
  });
}

function uploadProfilePictureBuffer({ userId, buffer, mimetype }) {
  return uploadImageBuffer({
    buffer,
    mimetype,
    folder: CLOUDINARY_FOLDERS.PROFILE_PICTURES,
    publicIdPrefix: `profile-${userId || "unknown"}`,
  });
}

function uploadRecipeImageBuffer({ recipeId, buffer, mimetype }) {
  return uploadImageBuffer({
    buffer,
    mimetype,
    folder: CLOUDINARY_FOLDERS.RECIPE_IMAGES,
    publicIdPrefix: `recipe-${recipeId || "new"}`,
  });
}

function destroyImageByPublicId(publicId) {
  return cloudinary.uploader.destroy(publicId);
}

function toCloudinaryUrl(publicId) {
  return cloudinary.url(publicId, { secure: true });
}

module.exports = {
  uploadProfilePictureBuffer,
  uploadRecipeImageBuffer,
  destroyImageByPublicId,
  toCloudinaryUrl,
};
