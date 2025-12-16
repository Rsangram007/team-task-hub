const express = require("express");
const router = express.Router();
const { validate, schemas } = require("../middleware/validation");
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const { authenticateJWT, authorizeTaskOwner } = require("../middleware/auth");

// Get all tasks (with filtering)
router.get("/", authenticateJWT, getAllTasks);

// Create a new task
router.post("/", authenticateJWT, validate(schemas.createTask), createTask);

// Get a specific task by ID
router.get("/:id", authenticateJWT, getTaskById);

// Update a task
router.put(
  "/:id",
  authenticateJWT,
  authorizeTaskOwner,
  validate(schemas.updateTask),
  updateTask
);

// Delete a task
router.delete("/:id", authenticateJWT, authorizeTaskOwner, deleteTask);

module.exports = router;
