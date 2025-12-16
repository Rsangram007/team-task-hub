// Utility functions for WebSocket events

// Emit task created event
const emitTaskCreated = (io, task) => {
  // Emit to all connected clients
  io.emit("task_created", task);

  // Emit to task assignee if exists
  if (task.assigned_to_id) {
    io.to(`user_${task.assigned_to_id}`).emit("task_assigned", task);
  }

  // Emit to task creator
  io.to(`user_${task.creator_id}`).emit("task_created_by_me", task);
};

// Emit task updated event
const emitTaskUpdated = (io, task) => {
  // Emit to all connected clients
  io.emit("task_updated", task);

  // Emit to task assignee if exists
  if (task.assigned_to_id) {
    io.to(`user_${task.assigned_to_id}`).emit("task_assigned", task);
  }

  // Emit to task creator
  io.to(`user_${task.creator_id}`).emit("task_updated_by_me", task);
};

// Emit task deleted event
const emitTaskDeleted = (io, taskId) => {
  // Emit to all connected clients
  io.emit("task_deleted", taskId);
};

// Emit notification created event
const emitNotificationCreated = (io, notification) => {
  // Emit to specific user
  io.to(`user_${notification.user_id}`).emit(
    "notification_created",
    notification
  );
};

module.exports = {
  emitTaskCreated,
  emitTaskUpdated,
  emitTaskDeleted,
  emitNotificationCreated,
};
