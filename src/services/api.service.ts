const API_BASE_URL = "http://localhost:5001/api";

interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  employeeId: string;
  department: string;
  role: string;
}

interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  token?: string;
  user?: any;
  createdUser?: any;
  employees?: any[];
  users?: any[];
  roles?: any[];
  logs?: any[];
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("authToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async registerUser(data: RegisterUserData): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to register user");
    }

    return response.json();
  }

  async login(email: string, password: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    const data = await response.json();
    if (data.token) {
      localStorage.setItem("authToken", data.token);
    }

    return data;
  }

  async getCurrentUser(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch user");
    }

    return response.json();
  }

  async getAllEmployees(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/hr/employees`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch employees");
    }

    return response.json();
  }

  // Admin Methods
  async getAllUsers(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch users");
    }

    return response.json();
  }

  async deleteUser(userId: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete user");
    }

    return response.json();
  }

  // Role Management
  async getRoles(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/admin/roles`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch roles");
    return response.json();
  }

  async createRole(data: {
    name: string;
    permissions?: string[];
  }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/roles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create role");
    }
    return response.json();
  }

  async updateRole(
    id: string,
    data: { name?: string; permissions?: string[] }
  ): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/roles/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update role");
    }
    return response.json();
  }

  async deleteRole(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/roles/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete role");
    }
    return response.json();
  }

  async updateUserStatus(
    userId: string,
    status: "active" | "inactive"
  ): Promise<ApiResponse> {
    const response = await fetch(
      `${API_BASE_URL}/admin/users/${userId}/status`,
      {
        method: "PATCH",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update user status");
    }

    return response.json();
  }

  async resetUserPassword(userId: string): Promise<ApiResponse> {
    const response = await fetch(
      `${API_BASE_URL}/admin/users/${userId}/reset-password`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to reset password");
    }

    return response.json();
  }

  async getPermissions(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/admin/permissions`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch permissions");
    }

    return response.json();
  }

  async getAuditLogs(filters?: any): Promise<ApiResponse> {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(
      `${API_BASE_URL}/admin/audit-logs?${queryParams}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch audit logs");
    }

    return response.json();
  }
}

export const apiService = new ApiService();
export type { RegisterUserData, ApiResponse };
