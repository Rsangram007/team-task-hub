// apiClient.ts
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://team-task-hub.onrender.com/api";

interface ApiError extends Error {
  status?: number;
  data?: any;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = new Headers(options.headers || {});

    headers.set("Content-Type", "application/json");

    if (this.token) {
      headers.set("Authorization", `Bearer ${this.token}`);
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        ) as ApiError;
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        const networkError = new Error(
          "Network error - please check your connection"
        ) as ApiError;
        networkError.status = 0;
        throw networkError;
      }
      throw error;
    }
  }

  // Auth endpoints
  async register(userData: {
    email: string;
    password: string;
    fullName: string;
  }) {
    return this.request<{ token: string; user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }) {
    return this.request<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async getCurrentUser() {
    return this.request<{ user: any }>("/auth/me");
  }

  // Task endpoints
  async getTasks(filters?: any) {
    let url = "/tasks";
    if (filters) {
      const params = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key]);
        }
      });
      url += `?${params.toString()}`;
    }
    return this.request<any[]>("/tasks");
  }

  async createTask(taskData: any) {
    return this.request<any>("/tasks", {
      method: "POST",
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(id: string, taskData: any) {
    return this.request<any>(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(id: string) {
    return this.request<void>(`/tasks/${id}`, {
      method: "DELETE",
    });
  }

  // Profile endpoints
  async getProfiles() {
    return this.request<any[]>("/profiles");
  }

  async updateProfile(profileData: any) {
    return this.request<any>("/profiles/me", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  // Image upload endpoints
  async uploadImage(imageData: { image: string; folder?: string }) {
    return this.request<any>("/profile-images/upload", {
      method: "POST",
      body: JSON.stringify(imageData),
    });
  }

  // Notification endpoints
  async getNotifications() {
    return this.request<any[]>("/notifications");
  }

  async markNotificationAsRead(id: string) {
    return this.request<any>(`/notifications/${id}/read`, {
      method: "PUT",
    });
  }

  async markAllNotificationsAsRead() {
    return this.request<any>("/notifications/read-all", {
      method: "PUT",
    });
  }

  async getUnreadNotificationsCount() {
    return this.request<{ count: number }>("/notifications/unread-count");
  }
}

export const apiClient = new ApiClient();
