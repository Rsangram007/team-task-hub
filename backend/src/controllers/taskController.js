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
    console.log("Received task data:", req.body);
    const userId = req.user.userId; // Use userId from the decoded token
    const taskData = {
      ...req.body,
      creator_id: userId, // Set creator to current user
    };

    const task = await dbService.createTask(taskData);

    // Create notification if task is assigned to someone
    if (task.assigned_to_id && task.assigned_to_id !== userId) {
      const creatorProfile = await dbService.getUserProfile(userId);
      const creatorName = creatorProfile
        ? creatorProfile.full_name || "Someone"
        : "Someone";

      await dbService.createNotification({
        userId: task.assigned_to_id,
        title: "New task assigned",
        message: `${creatorName} assigned you to: ${task.title}`,
        taskId: task.id,
      });
    }

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

    // Create notification if task is newly assigned or reassigned
    if (
      task.assigned_to_id &&
      task.assigned_to_id !== existingTask.assigned_to_id &&
      task.assigned_to_id !== userId
    ) {
      const updaterProfile = await dbService.getUserProfile(userId);
      const updaterName = updaterProfile
        ? updaterProfile.full_name || "Someone"
        : "Someone";

      await dbService.createNotification({
        userId: task.assigned_to_id,
        title: "Task assigned",
        message: `${updaterName} assigned you to: ${task.title}`,
        taskId: task.id,
      });
    }

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

    // Emit task deleted event via WebSocket
    const { app } = require("../server");
    const io = app.get("io");
    if (io) {
      const { emitTaskDeleted } = require("../utils/websocket");
      emitTaskDeleted(io, id);
    }

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
