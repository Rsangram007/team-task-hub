const dbService = require("../services/dbService");

// Get all tasks with optional filters
const getAllTasks = async (req, res) => {
  try {
    const userId = req.user.userId; // Use userId from the decoded token
    const filters = req.query;

    // Add user-specific filters
    const userFilters = {
      ...filters,
      assignedToMe: filters.assignedToMe ? userId : undefined,
      createdByMe: filters.createdByMe ? userId : undefined,
    };

    const tasks = await dbService.getAllTasks(userFilters);
    res.json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a specific task by ID
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await dbService.getTaskById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new task
const createTask = async (req, res) => {
  try {
    const userId = req.user.userId; // Use userId from the decoded token
    const taskData = {
      ...req.body,
      creatorId: userId, // Set creator to current user
    };

    // Validate required fields
    if (!taskData.title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const task = await dbService.createTask(taskData);

    // Create audit log
    await dbService.createAuditLog({
      taskId: task.id,
      userId: userId,
      action: "created",
      newValue: task,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update an existing task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId; // Use userId from the decoded token
    const taskData = req.body;

    // Get the existing task
    const existingTask = await dbService.getTaskById(id);
    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Update the task
    const task = await dbService.updateTask(id, taskData);

    // Create audit log
    await dbService.createAuditLog({
      taskId: id,
      userId: userId,
      action: "updated",
      oldValue: existingTask,
      newValue: task,
    });

    res.json(task);
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId; // Use userId from the decoded token

    // Get the existing task
    const existingTask = await dbService.getTaskById(id);
    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Delete the task
    const task = await dbService.deleteTask(id);

    // Create audit log
    await dbService.createAuditLog({
      taskId: id,
      userId: userId,
      action: "deleted",
      oldValue: existingTask,
    });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
