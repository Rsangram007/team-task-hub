import { z } from "zod";

/**
 * Validation schema for user registration
 */
export const signUpSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(128, { message: "Password must be less than 128 characters" }),
  fullName: z
    .string()
    .trim()
    .min(1, { message: "Full name is required" })
    .max(100, { message: "Full name must be less than 100 characters" }),
});

/**
 * Validation schema for user login
 */
export const signInSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

/**
 * Validation schema for creating a task
 */
export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "Title is required" })
    .max(100, { message: "Title must be less than 100 characters" }),
  description: z
    .string()
    .trim()
    .max(5000, { message: "Description must be less than 5000 characters" })
    .optional(),
  dueDate: z.date().optional().nullable(),
  priority: z.enum(["low", "medium", "high", "urgent"], {
    message: "Invalid priority",
  }),
  status: z.enum(["todo", "in_progress", "review", "completed"], {
    message: "Invalid status",
  }),
  assignedToId: z.string().uuid().optional().nullable(),
});

/**
 * Validation schema for updating a task
 */
export const updateTaskSchema = createTaskSchema.partial();

/**
 * Validation schema for profile updates
 */
export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, { message: "Full name is required" })
    .max(100, { message: "Full name must be less than 100 characters" }),
  email: z.string().email({ message: "Invalid email address" }).optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
