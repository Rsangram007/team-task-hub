const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dbService = require("../services/dbService");

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  });
};

// Register a new user
const register = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Check if user already exists
    const existingUser = await dbService.getUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user in database
    const newUser = await dbService.createUser({
      email,
      password: hashedPassword,
      fullName,
    });

    if (!newUser) {
      return res.status(400).json({ message: "Failed to create user" });
    }

    // Create profile
    const profile = await dbService.createProfile({
      userId: newUser.id,
      fullName: fullName,
    });

    if (!profile) {
      return res.status(400).json({ message: "Failed to create profile" });
    }

    // Generate JWT token
    const token = generateToken(newUser.id);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName,
        avatarUrl: profile.avatar_url || null,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user from database
    const user = await dbService.getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Get user profile
    const profile = await dbService.getUserProfile(user.id);

    if (!profile) {
      return res.status(400).json({ message: "Profile not found" });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url || null,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// Get current user profile
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user and profile data
    const user = await dbService.getUserById(userId);
    const profile = await dbService.getUserProfile(userId);

    if (!profile) {
      return res.status(400).json({ message: "Profile not found" });
    }

    res.json({
      user: {
        id: userId,
        email: user.email,
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url || null,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
};
