const cloudinaryService = require("../services/cloudinaryService");
const dbService = require("../services/dbService");

/**
 * Upload an image to Cloudinary
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadImage = async (req, res) => {
  try {
    const { image, folder = "avatars" } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    // Validate base64 image format
    if (!image.startsWith("data:image")) {
      return res.status(400).json({ error: "Invalid image format" });
    }

    const result = await cloudinaryService.uploadImage(image, folder);

    // Update user profile with the new avatar URL
    const userId = req.user.userId; // Use userId from the decoded token
    if (userId) {
      // First get the current profile to preserve the full name
      const currentProfile = await dbService.getUserProfile(userId);
      console.log("Current profile:", currentProfile);

      // Update only the avatar URL while preserving the full name
      const updatedProfile = await dbService.updateProfile(userId, {
        fullName: currentProfile.full_name,
        avatarUrl: result.url,
      });
      console.log("Updated profile:", updatedProfile);
    }

    res.json({
      url: result.url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({ error: error.message || "Failed to upload image" });
  }
};

/**
 * Delete an image from Cloudinary
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ error: "No public ID provided" });
    }

    const result = await cloudinaryService.deleteImage(publicId);

    res.json({ message: "Image deleted successfully", result });
  } catch (error) {
    console.error("Image delete error:", error);
    res.status(500).json({ error: error.message || "Failed to delete image" });
  }
};

module.exports = {
  uploadImage,
  deleteImage,
};
