# Team Task Hub

A collaborative task management application with real-time updates, built with modern web technologies.

## Project Structure

```
team-task-hub/
├── frontend/          # React frontend application
└── backend/           # Node.js backend API
```

## Technologies Used

### Frontend

- React with Pages Router
- TypeScript
- Tailwind CSS
- UI component library (shadcn-ui)
- Socket.IO client for real-time updates
- React Query for data fetching
- React Hook Form for form handling
- Zod for validation

### Backend

- Node.js + Express
- PostgreSQL database
- Socket.IO for real-time communication
- 'Cloudinary`' for image hosting
- JWT for authentication
- Bcrypt.js for password hashing
- Joi for request validation

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- NPM or yarn
- PostgreSQL database
- `Cloudinary` account

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd team-task-hub
```

2. Install frontend dependencies:

```bash
cd frontend
npm install
```

3. Install backend dependencies:

```bash
cd ../backend
npm install
```

### Configuration

#### Frontend

For local development, create a `.env` file in the `frontend` directory with:

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api
VITE_WEBSOCKET_URL=http://localhost:3000
```

For production deployments, create a `.env.production` file with:

```env
# API Configuration for Render
VITE_API_URL=https://your-app-name.onrender.com/api
VITE_WEBSOCKET_URL=https://your-app-name.onrender.com
```

#### Backend

For local development, create a `.env` file in the `backend` directory with:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database Configuration for Development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=team_task_hub
DB_USER=postgres
DB_PASSWORD=your_local_db_password

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_key_change_this
JWT_EXPIRES_IN=24h

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

For production deployment (Render, Heroku, etc.), the application will automatically use the `DATABASE_URL` environment variable provided by the platform.

### Database Setup

1. Create a PostgreSQL database named `team_task_hub`
2. Run the schema from `backend/sql/schema.sql` to set up the tables:

```bash
psql -U your_db_username -d team_task_hub -f backend/sql/schema.sql
```

### Running the Application

#### Frontend Development

```bash
cd frontend
npm run dev
```

The frontend will be available at http://localhost:5173

#### Backend Development

```bash
cd backend
npm run dev
```

The backend API will be available at http://localhost:3000

## API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Register a New User

**POST** `/auth/register`

Registers a new user account.

##### Request Body

```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
```

##### Response

```json
{
  "message": "User registered successfully",
  "token": "JWT_TOKEN",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "fullName": "John Doe"
  }
}
```

#### Login

**POST** `/auth/login`

Authenticate a user and receive a JWT token.

##### Request Body

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

##### Response

```json
{
  "message": "Login successful",
  "token": "JWT_TOKEN",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "fullName": "John Doe"
  }
}
```

#### Get Current User

**GET** `/auth/me`

Retrieve the authenticated user's profile information.

##### Response

```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "fullName": "John Doe",
    "avatarUrl": "https://example.com/avatar.jpg"
  }
}
```

### Tasks

#### Get All Tasks

**GET** `/tasks`

Retrieve all tasks with optional filtering and sorting.

##### Query Parameters

| Parameter    | Type         | Description                                                  |
| ------------ | ------------ | ------------------------------------------------------------ |
| status       | string/array | Filter by task status (todo, in_progress, review, completed) |
| priority     | string/array | Filter by task priority (low, medium, high, urgent)          |
| assignedToMe | Boolean      | Filter tasks assigned to the current user                    |
| createdByMe  | Boolean      | Filter tasks created by the current user                     |
| overdue      | Boolean      | Filter overdue tasks                                         |
| sortBy       | string       | Field to sort by (created_at, due_date, priority, status)    |
| sortOrder    | string       | Sort order (ascending, descending)                           |

##### Response

```json
[
  {
    "id": "task-id",
    "title": "Task Title",
    "description": "Task description",
    "due_date": "2023-12-31T00:00:00.000Z",
    "priority": "high",
    "status": "in_progress",
    "creator_id": "user-id",
    "assigned_to_id": "assignee-id",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z",
    "creator": {
      "full_name": "John Doe",
      "avatar_url": "https://example.com/avatar.jpg"
    },
    "assignee": {
      "full_name": "Jane Smith",
      "avatar_url": "https://example.com/avatar2.jpg"
    }
  }
]
```

#### Create a New Task

**POST** `/tasks`

Create a new task.

##### Request Body

```json
{
  "title": "New Task",
  "description": "Task description",
  "dueDate": "2023-12-31T00:00:00.000Z",
  "priority": "medium",
  "status": "todo",
  "assignedToId": "assignee-id"
}
```

##### Response

```json
{
  "id": "task-id",
  "title": "New Task",
  "description": "Task description",
  "due_date": "2023-12-31T00:00:00.000Z",
  "priority": "medium",
  "status": "todo",
  "creator_id": "user-id",
  "assigned_to_id": "assignee-id",
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z"
}
```

#### Get a Specific Task

**GET** `/tasks/{id}`

Retrieve a specific task by ID.

##### Response

```json
{
  "id": "task-id",
  "title": "Task Title",
  "description": "Task description",
  "due_date": "2023-12-31T00:00:00.000Z",
  "priority": "high",
  "status": "in_progress",
  "creator_id": "user-id",
  "assigned_to_id": "assignee-id",
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z",
  "creator": {
    "full_name": "John Doe",
    "avatar_url": "https://example.com/avatar.jpg"
  },
  "assignee": {
    "full_name": "Jane Smith",
    "avatar_url": "https://example.com/avatar2.jpg"
  }
}
```

#### Update a Task

**PUT** `/tasks/{id}`

Update an existing task.

##### Request Body

```json
{
  "title": "Updated Task Title",
  "description": "Updated task description",
  "dueDate": "2023-12-31T00:00:00.000Z",
  "priority": "high",
  "status": "in_progress",
  "assignedToId": "new-assignee-id"
}
```

##### Response

```json
{
  "id": "task-id",
  "title": "Updated Task Title",
  "description": "Updated task description",
  "due_date": "2023-12-31T00:00:00.000Z",
  "priority": "high",
  "status": "in_progress",
  "creator_id": "user-id",
  "assigned_to_id": "new-assignee-id",
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-02T00:00:00.000Z"
}
```

#### Delete a Task

**DELETE** `/tasks/{id}`

Delete a task by ID.

##### Response

```json
{
  "message": "Task deleted successfully"
}
```

### Profiles

#### Get All User Profiles

**GET** `/profiles`

Retrieve all user profiles.

##### Response

```json
[
  {
    "id": "profile-id",
    "user_id": "user-id",
    "full_name": "John Doe",
    "avatar_url": "https://example.com/avatar.jpg",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  }
]
```

#### Get a Specific Profile

**GET** `/profiles/{id}`

Retrieve a specific user profile by user ID.

##### Response

```json
{
  "id": "profile-id",
  "user_id": "user-id",
  "full_name": "John Doe",
  "avatar_url": "https://example.com/avatar.jpg",
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z"
}
```

#### Update Current User Profile

**PUT** `/profiles/me`

Update the authenticated user's profile.

##### Request Body

```json
{
  "fullName": "John Updated",
  "avatarUrl": "https://example.com/new-avatar.jpg"
}
```

##### Response

```json
{
  "id": "profile-id",
  "user_id": "user-id",
  "full_name": "John Updated",
  "avatar_url": "https://example.com/new-avatar.jpg",
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-02T00:00:00.000Z"
}
```

### Notifications

#### Get User Notifications

**GET** `/notifications`

Retrieve all notifications for the authenticated user.

##### Response

```json
[
  {
    "id": "notification-id",
    "user_id": "user-id",
    "title": "New task assigned",
    "message": "You have been assigned to: Task Title",
    "task_id": "task-id",
    "read": false,
    "created_at": "2023-01-01T00:00:00.000Z",
    "task": {
      "title": "Task Title"
    }
  }
]
```

#### Mark Notification as Read

**PUT** `/notifications/{id}/read`

Mark a specific notification as read.

##### Response

```json
{
  "id": "notification-id",
  "user_id": "user-id",
  "title": "New task assigned",
  "message": "You have been assigned to: Task Title",
  "task_id": "task-id",
  "read": true,
  "created_at": "2023-01-01T00:00:00.000Z"
}
```

#### Mark All Notifications as Read

**PUT** `/notifications/read-all`

Mark all notifications for the authenticated user as read.

##### Response

```json
{
  "message": "All notifications marked as read",
  "count": 5
}
```

#### Get Unread Notifications Count

**GET** `/notifications/unread-count`

Get the count of unread notifications for the authenticated user.

##### Response

```json
{
  "count": 3
}
```

### Audit Logs

#### Get Task Audit Logs

**GET** `/audit/task/{taskId}`

Retrieve audit logs for a specific task.

##### Response

```json
[
  {
    "id": "audit-log-id",
    "task_id": "task-id",
    "user_id": "user-id",
    "action": "updated",
    "old_value": {
      "title": "Old Title"
    },
    "new_value": {
      "title": "New Title"
    },
    "created_at": "2023-01-01T00:00:00.000Z",
    "user": {
      "full_name": "John Doe",
      "avatar_url": "https://example.com/avatar.jpg"
    }
  }
]
```

#### Get All Audit Logs

**GET** `/audit`

Retrieve all audit logs (admin only).

##### Response

```json
[
  {
    "id": "audit-log-id",
    "task_id": "task-id",
    "user_id": "user-id",
    "action": "created",
    "old_value": null,
    "new_value": {
      "title": "New Task"
    },
    "created_at": "2023-01-01T00:00:00.000Z",
    "user": {
      "full_name": "John Doe",
      "avatar_url": "https://example.com/avatar.jpg"
    },
    "task": {
      "title": "New Task"
    }
  }
]
```

### WebSocket Events

The application uses Socket.IO for real-time communication. Clients can listen for the following events:

#### Task Events

- `task_created` - Emitted when a new task is created
- `task_updated` - Emitted when a task is updated
- `task_deleted` - Emitted when a task is deleted
- `task_assigned` - Emitted when a task is assigned to a user
- `task_created_by_me` - Emitted when a task is created by the current user
- `task_updated_by_me` - Emitted when a task created by the current user is updated

#### Notification Events

- `notification_created` - Emitted when a new notification is created for a user

#### Connection Events

- `connect` - Emitted when a client connects
- `disconnect` - Emitted when a client disconnects
- `join_room` - Join a specific room
- `leave_room` - Leave a specific room

### Error Responses

All error responses follow this format:

```json
{
  "message": "Error description"
}
```

Common HTTP status codes:

- `400` - Bad Request (validation errors, malformed requests)
- `401` - Unauthorized (missing or invalid authentication)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error (unexpected server errors)

## Cloudinary Integration

### Overview

Cloudinary has been successfully integrated for image uploads in the Team Task Hub backend. This replaces the previous Supabase function approach with a direct Cloudinary integration that provides better performance and more control over image processing.

### Features

#### Image Upload

- Accepts base64 encoded images
- Automatically resizes images to 500x500 pixels
- Applies automatic quality optimization
- Converts images to optimal formats (WebP, etc.)
- Organizes images in folders (avatars by default)
- Returns secure URLs for image access

#### Image Processing

- Automatic format detection and conversion
- Quality optimization to reduce file sizes
- Resize and crop transformations
- Secure delivery via HTTPS

#### Security

- JWT authentication required for all image operations
- Input validation for image formats
- Secure credential storage in environment variables
- Error handling to prevent information leakage

### API Endpoints

#### Upload Image

- **POST** `/api/images/upload`
- **POST** `/api/profile-images/upload`
- Requires authentication
- Accepts base64 image data and optional folder parameter
- Returns image URL and public ID

#### Delete Image

- **POST** `/api/images/delete`
- Requires authentication
- Accepts public ID of image to delete
- Returns deletion confirmation

### Benefits

#### Performance

- Direct Cloudinary integration is faster than Supabase functions
- Automatic image optimization reduces bandwidth usage
- CDN delivery ensures fast image loading globally

#### Flexibility

- Full control over image transformations
- Easy to customize image processing pipeline
- Can organize images in different folders
- Support for various image formats

#### Reliability

- Cloudinary provides 99.99% uptime SLA
- Automatic backup and redundancy
- Global CDN for fast delivery
- Scalable infrastructure

## PostgreSQL Migration

### Overview

The Team Task Hub backend has been successfully migrated to use PostgreSQL directly instead of relying solely on Supabase client for database operations. The application still uses Supabase for authentication but now handles all database operations through direct PostgreSQL connections.

### Changes Made

#### 1. Added PostgreSQL Client

- Installed `pg` package for PostgreSQL connectivity
- Created database configuration file (`src/config/db.js`)
- Set up connection pooling for efficient database access

#### 2. Created Database Service Layer

- Created `src/services/dbService.js` to encapsulate all database operations
- Implemented functions for all CRUD operations on tasks, profiles, notifications, and audit logs
- Added proper error handling and data validation

#### 3. Updated Controllers

- Modified all controllers to use the new database service instead of Supabase client
- Updated authentication controller to still use Supabase for auth but PostgreSQL for profile data
- Maintained all existing API contracts and response formats

#### 4. Database Schema

- Created `sql/schema.sql` with the complete PostgreSQL schema
- Included all tables: profiles, tasks, notifications, task_audit_log
- Added appropriate indexes and foreign key constraints
- Defined enumeration types for task priority and status

#### 5. Environment Configuration

- Updated `.env` file with PostgreSQL connection parameters
- Kept Supabase configuration for authentication purposes

### Benefits of This Migration

#### Performance

- Direct database connections are faster than Supabase client overhead
- Connection pooling improves concurrent request handling
- Better control over query optimization

#### Flexibility

- Can now run the application with any PostgreSQL database
- Reduced dependency on Supabase infrastructure for database operations
- Easier to migrate to different hosting providers

#### Maintainability

- Centralized database operations in service layer
- Improved code organization and separation of concerns
- Easier to test database operations independently

## Project Structure Details

### Backend

The backend is structured with a modular architecture:

```
backend/
├── src/
│   ├── controllers/    # Business logic
│   ├── routes/         # API endpoints
│   ├── middleware/     # Authentication, validation
│   ├── services/       # Database operations
│   ├── config/         # Configuration files
│   └── utils/          # Utility functions
├── sql/                # Database schema
├── server.js           # Main entry point
└── package.json        # Dependencies
```

### Frontend

The frontend follows a component-based architecture:

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   ├── types/          # TypeScript types
│   └── integrations/   # Third-party service integrations
├── public/             # Static assets
└── package.json        # Dependencies
```

## Deployment

### Backend Deployment

1. Set up a PostgreSQL database on your deployment platform
2. Update the `.env` file with production database credentials
3. Deploy the backend using your preferred hosting service (Heroku, AWS, DigitalOcean, etc.)

### Frontend Deployment

1. Build the production version:

```bash
cd frontend
npm run build
```

2. Deploy the contents of the `dist/` folder to your preferred static hosting service

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License.
