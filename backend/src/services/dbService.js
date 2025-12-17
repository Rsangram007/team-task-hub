const db = require("../config/db");

// User/Profile operations
const getUserByEmail = async (email) => {
  const query = `
    SELECT id, email, password
    FROM users
    WHERE email = $1
  `;
  const result = await db.query(query, [email]);
  return result.rows[0];
};

const getUserById = async (userId) => {
  const query = `
    SELECT id, email
    FROM users
    WHERE id = $1
  `;
  const result = await db.query(query, [userId]);
  return result.rows[0];
};

const createUser = async (userData) => {
  const { email, password, fullName } = userData;

  const query = `
    INSERT INTO users (email, password)
    VALUES ($1, $2)
    RETURNING id, email
  `;

  const result = await db.query(query, [email, password]);
  return result.rows[0];
};

const createProfile = async (profileData) => {
  const { userId, fullName } = profileData;

  const query = `
    INSERT INTO profiles (user_id, full_name)
    VALUES ($1, $2)
    RETURNING id, user_id, full_name, avatar_url, created_at, updated_at
  `;

  const result = await db.query(query, [userId, fullName]);
  return result.rows[0];
};

const getUserProfile = async (userId) => {
  const query = `
    SELECT id, user_id, full_name, avatar_url, created_at, updated_at
    FROM profiles
    WHERE user_id = $1
  `;
  const result = await db.query(query, [userId]);
  return result.rows[0];
};

const getAllProfiles = async () => {
  const query = `
    SELECT id, user_id, full_name, avatar_url, created_at, updated_at
    FROM profiles
    ORDER BY full_name ASC
  `;
  const result = await db.query(query);
  return result.rows;
};

const updateProfile = async (userId, { fullName, avatarUrl }) => {
  // Build dynamic query based on provided fields
  const fields = [];
  const values = [];
  let paramCount = 1;

  if (fullName !== undefined) {
    fields.push(`full_name = $${paramCount}`);
    values.push(fullName);
    paramCount++;
  }

  if (avatarUrl !== undefined) {
    fields.push(`avatar_url = $${paramCount}`);
    values.push(avatarUrl);
    paramCount++;
  }

  // Always update the timestamp
  fields.push("updated_at = NOW()");

  if (fields.length === 1) {
    // Only timestamp would be updated, skip the update
    return await getUserProfile(userId);
  }

  const query = `
    UPDATE profiles
    SET ${fields.join(", ")}
    WHERE user_id = $${paramCount}
    RETURNING id, user_id, full_name, avatar_url, created_at, updated_at
  `;

  values.push(userId);

  const result = await db.query(query, values);
  return result.rows[0];
};

// Update user email
const updateUserEmail = async (userId, email) => {
  const query = `
    UPDATE users
    SET email = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING id, email, created_at, updated_at
  `;
  const result = await db.query(query, [email, userId]);
  return result.rows[0];
};

// Task operations
const getAllTasks = async (filters = {}) => {
  let query = `
    SELECT t.*, 
           p1.full_name as creator_name, p1.avatar_url as creator_avatar,
           p2.full_name as assignee_name, p2.avatar_url as assignee_avatar
    FROM tasks t
    LEFT JOIN profiles p1 ON t.creator_id = p1.user_id
    LEFT JOIN profiles p2 ON t.assigned_to_id = p2.user_id
  `;

  const queryParams = [];
  const conditions = [];

  if (filters.status && filters.status.length > 0) {
    conditions.push(`t.status = ANY($${queryParams.length + 1})`);
    queryParams.push(filters.status);
  }

  if (filters.priority && filters.priority.length > 0) {
    conditions.push(`t.priority = ANY($${queryParams.length + 1})`);
    queryParams.push(filters.priority);
  }

  if (filters.assignedToMe) {
    conditions.push(`t.assigned_to_id = $${queryParams.length + 1}`);
    queryParams.push(filters.assignedToMe);
  }

  if (filters.createdByMe) {
    conditions.push(`t.creator_id = $${queryParams.length + 1}`);
    queryParams.push(filters.createdByMe);
  }

  if (filters.overdue) {
    conditions.push(`t.due_date < NOW() AND t.status != 'completed'`);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += ` ORDER BY t.created_at DESC`;

  const result = await db.query(query, queryParams);
  return result.rows;
};

const getTaskById = async (taskId) => {
  const query = `
    SELECT t.*, 
           p1.full_name as creator_name, p1.avatar_url as creator_avatar,
           p2.full_name as assignee_name, p2.avatar_url as assignee_avatar
    FROM tasks t
    LEFT JOIN profiles p1 ON t.creator_id = p1.user_id
    LEFT JOIN profiles p2 ON t.assigned_to_id = p2.user_id
    WHERE t.id = $1
  `;
  const result = await db.query(query, [taskId]);
  return result.rows[0];
};

const createTask = async (taskData) => {
  const {
    title,
    description,
    due_date,
    priority,
    status,
    creator_id,
    assigned_to_id,
  } = taskData;

  const query = `
    INSERT INTO tasks (title, description, due_date, priority, status, creator_id, assigned_to_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;

  const result = await db.query(query, [
    title,
    description || null,
    due_date || null,
    priority,
    status,
    creator_id,
    assigned_to_id || null,
  ]);

  return result.rows[0];
};

const updateTask = async (taskId, taskData) => {
  const { title, description, due_date, priority, status, assigned_to_id } =
    taskData;

  const query = `
    UPDATE tasks
    SET title = $1, description = $2, due_date = $3, priority = $4, status = $5, 
        assigned_to_id = $6, updated_at = NOW()
    WHERE id = $7
    RETURNING *
  `;

  const result = await db.query(query, [
    title,
    description || null,
    due_date || null,
    priority,
    status,
    assigned_to_id || null,
    taskId,
  ]);

  return result.rows[0];
};

const deleteTask = async (taskId) => {
  const query = `DELETE FROM tasks WHERE id = $1 RETURNING *`;
  const result = await db.query(query, [taskId]);
  return result.rows[0];
};

// Notification operations
const getUserNotifications = async (userId) => {
  const query = `
    SELECT n.*, t.title as task_title
    FROM notifications n
    LEFT JOIN tasks t ON n.task_id = t.id
    WHERE n.user_id = $1
    ORDER BY n.created_at DESC
    LIMIT 50
  `;
  const result = await db.query(query, [userId]);
  return result.rows;
};

const createNotification = async (notificationData) => {
  const { userId, title, message, taskId } = notificationData;

  const query = `
    INSERT INTO notifications (user_id, title, message, task_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

  const result = await db.query(query, [
    userId,
    title,
    message,
    taskId || null,
  ]);

  // Emit notification event via WebSocket
  const notification = result.rows[0];
  const { app } = require("../../server");
  const io = app.get("io");
  if (io) {
    const { emitNotificationCreated } = require("../utils/websocket");
    emitNotificationCreated(io, notification);
  }

  return notification;
};

const markNotificationAsRead = async (notificationId, userId) => {
  const query = `
    UPDATE notifications
    SET read = true
    WHERE id = $1 AND user_id = $2
    RETURNING *
  `;
  const result = await db.query(query, [notificationId, userId]);
  return result.rows[0];
};

const markAllNotificationsAsRead = async (userId) => {
  const query = `
    UPDATE notifications
    SET read = true
    WHERE user_id = $1 AND read = false
    RETURNING *
  `;
  const result = await db.query(query, [userId]);
  return result.rows;
};

const getUnreadNotificationsCount = async (userId) => {
  const query = `
    SELECT COUNT(*) as count
    FROM notifications
    WHERE user_id = $1 AND read = false
  `;
  const result = await db.query(query, [userId]);
  return parseInt(result.rows[0].count);
};

// Audit log operations
const createAuditLog = async (auditData) => {
  const { taskId, userId, action, oldValue, newValue } = auditData;

  const query = `
    INSERT INTO task_audit_log (task_id, user_id, action, old_value, new_value)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  const result = await db.query(query, [
    taskId,
    userId || null,
    action,
    oldValue ? JSON.stringify(oldValue) : null,
    newValue ? JSON.stringify(newValue) : null,
  ]);

  return result.rows[0];
};

const getTaskAuditLogs = async (taskId) => {
  const query = `
    SELECT a.*, p.full_name as user_name, p.avatar_url as user_avatar
    FROM task_audit_log a
    LEFT JOIN profiles p ON a.user_id = p.user_id
    WHERE a.task_id = $1
    ORDER BY a.created_at DESC
  `;
  const result = await db.query(query, [taskId]);
  return result.rows;
};

module.exports = {
  // Profile operations
  getUserByEmail,
  getUserById,
  createUser,
  createProfile,
  getUserProfile,
  getAllProfiles,
  updateProfile,
  updateUserEmail,

  // Task operations
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,

  // Notification operations
  getUserNotifications,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationsCount,

  // Audit operations
  createAuditLog,
  getTaskAuditLogs,
};
