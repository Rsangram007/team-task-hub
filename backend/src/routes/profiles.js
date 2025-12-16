const express = require("express");
const router = express.Router();
const { validate, schemas } = require("../middleware/validation");
const {
  getAllProfiles,
  getCurrentUserProfile,
  updateCurrentUserProfile,
} = require("../controllers/profileController");
const { authenticateJWT } = require("../middleware/auth");

// Get all user profiles
router.get("/", authenticateJWT, getAllProfiles);

// Get current user profile
router.get("/me", authenticateJWT, getCurrentUserProfile);

// Update current user profile
router.put(
  "/me",
  authenticateJWT,
  validate(schemas.updateProfile),
  updateCurrentUserProfile
);

module.exports = router;
