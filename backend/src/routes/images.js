const express = require("express");
const router = express.Router();
const { uploadImage, deleteImage } = require("../controllers/imageController");
const { authenticateJWT } = require("../middleware/auth");

// Upload an image
router.post("/upload", authenticateJWT, uploadImage);

// Delete an image
router.post("/delete", authenticateJWT, deleteImage);

module.exports = router;
