const dbService = require("../services/dbService");

// Get audit logs for a specific task
const getTaskAuditLogs = async (req, res) => {
  try {
    const { taskId } = req.params;

    const auditLogs = await dbService.getTaskAuditLogs(taskId);

    res.json(auditLogs);
  } catch (error) {
    console.error("Get audit logs error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all audit logs (admin only)
const getAllAuditLogs = async (req, res) => {
  try {
    // In a real application, you would check if the user is an admin
    // For now, we'll just get all audit logs
    // This would need to be implemented in the dbService if needed

    res.status(501).json({ message: "Not implemented" });
  } catch (error) {
    console.error("Get all audit logs error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getTaskAuditLogs,
  getAllAuditLogs,
};
