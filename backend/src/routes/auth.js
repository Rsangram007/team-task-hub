const express = require("express");
const router = express.Router();
const { validate, schemas } = require("../middleware/validation");
const {
  register,
  login,
  getCurrentUser,
} = require("../controllers/authController");
const { authenticateJWT } = require("../middleware/auth");

// Register a new user
router.post("/register", validate(schemas.register), register);

// Login user
router.post("/login", validate(schemas.login), login);

// Get current user profile
router.get("/me", authenticateJWT, getCurrentUser);

module.exports = router;
