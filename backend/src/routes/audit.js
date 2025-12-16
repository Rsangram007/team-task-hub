const express = require("express");
const router = express.Router();
const {
  getTaskAuditLogs,
  getAllAuditLogs,
} = require("../controllers/auditController");
const { authenticateJWT } = require("../middleware/auth");

// Get audit logs for a specific task
router.get("/task/:taskId", authenticateJWT, getTaskAuditLogs);

// Get all audit logs (admin only)
router.get("/", authenticateJWT, getAllAuditLogs);

module.exports = router;
