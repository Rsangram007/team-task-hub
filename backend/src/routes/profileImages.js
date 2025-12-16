const express = require("express");
const router = express.Router();
const { uploadImage } = require("../controllers/imageController");
const { authenticateJWT } = require("../middleware/auth");

// Upload a profile image
router.post("/upload", authenticateJWT, uploadImage);

module.exports = router;
