const dbService = require("../services/dbService");

// Get all user profiles
const getAllProfiles = async (req, res) => {
  try {
    const profiles = await dbService.getAllProfiles();
    res.json(profiles);
  } catch (error) {
    console.error("Get profiles error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get current user profile
const getCurrentUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // Use userId from the decoded token
    const profile = await dbService.getUserProfile(userId);

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({ profile });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update current user profile
const updateCurrentUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // Use userId from the decoded token
    const { fullName, email, avatarUrl } = req.body;

    // Update user email if provided
    if (email) {
      const existingUser = await dbService.getUserByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: "Email already in use" });
      }
      await dbService.updateUserEmail(userId, email);
    }

    // Build update object with only provided fields
    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    // Only update profile if there are fields to update
    let profile = null;
    if (Object.keys(updateData).length > 0) {
      profile = await dbService.updateProfile(userId, updateData);

      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
    } else {
      // If no profile fields to update, just get the current profile
      profile = await dbService.getUserProfile(userId);
    }

    res.json({ profile });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllProfiles,
  getCurrentUserProfile,
  updateCurrentUserProfile,
};
