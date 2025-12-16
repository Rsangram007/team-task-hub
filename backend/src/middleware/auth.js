const jwt = require("jsonwebtoken");
const dbService = require("../services/dbService");

// JWT authentication middleware
const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const token = authHeader.split(" ")[1]; // Bearer TOKEN

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user data (including email)
    const user = await dbService.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "Invalid user" });
    }

    // Get profile data
    const profile = await dbService.getUserProfile(decoded.userId);
    if (!profile) {
      return res.status(401).json({ message: "Profile not found" });
    }

    // Attach both user and profile to request
    req.user = {
      ...decoded, // Keep the original decoded token (includes userId)
      ...user, // Add user data (email, etc.)
    };
    req.profile = profile;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

// Authorization middleware for task ownership
const authorizeTaskOwner = async (req, res, next) => {
  const taskId = req.params.id;
  const userId = req.user.userId; // Access userId from the decoded token

  try {
    // Check if user is the task creator or assignee
    const task = await dbService.getTaskById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.creator_id !== userId && task.assigned_to_id !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this task" });
    }

    req.task = task;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  authenticateJWT,
  authorizeTaskOwner,
};
