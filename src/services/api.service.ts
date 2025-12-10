const API_BASE_URL = "http://localhost:5001/api";
export const ASSET_BASE_URL = "http://localhost:5001/";

// export const API_BASE_URL = "https://hrms-backend-azure.vercel.app/api";
// export const ASSET_BASE_URL = "https://hrms-backend-azure.vercel.app";

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

  async login(
    email: string,
    password: string,
    location?: { lat: number; lng: number }
  ): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, location }),
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

  async getEmployeesOnLeave(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/leave/active`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch employees on leave");
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

  // Leave Policies
  async getLeavePolicies(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/leave-policies`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch leave policies");
    }
    return response.json();
  }

  async getLeavePolicy(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/leave-policies/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch leave policy");
    }
    return response.json();
  }

  async createLeavePolicy(data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/leave-policies`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create leave policy");
    }
    return response.json();
  }

  async updateLeavePolicy(id: string, data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/leave-policies/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to update leave policy");
    }
    return response.json();
  }

  async deleteLeavePolicy(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/leave-policies/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to delete leave policy");
    }
    return response.json();
  }

  // Leave Management (existing) Methods
  async getLeaveStats(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/leave/stats`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch leave stats");
    }
    return response.json();
  }

  async applyLeave(data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/leave/apply`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to apply for leave");
    }
    return response.json();
  }

  async getMyLeaves(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/leave/my-leaves`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch my leaves");
    return response.json();
  }

  async getPendingLeaveApprovals(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/leave/pending-approvals`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok)
      throw new Error("Failed to fetch pending leave approvals");
    return response.json();
  }

  async approveLeave(id: string, comments?: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/leave/${id}/approve`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ comments }),
    });
    if (!response.ok) throw new Error("Failed to approve leave");
    return response.json();
  }

  async rejectLeave(id: string, comments?: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/leave/${id}/reject`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ comments }),
    });
    if (!response.ok) throw new Error("Failed to reject leave");
    return response.json();
  }

  // Payroll Methods
  async upsertSalaryStructure(data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/payroll/structure`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to save salary structure");
    return response.json();
  }

  async getSalaryStructure(employeeId: string): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/payroll/structure/${employeeId}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    if (!response.ok) {
      if (response.status === 404) return { structure: null }; // Handle not found gracefully
      throw new Error("Failed to fetch salary structure");
    }
    return response.json();
  }

  async calculatePayroll(data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/payroll/calculate`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to calculate payroll");
    return response.json();
  }

  async getPayrollList(params?: any): Promise<any> {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(
      `${API_BASE_URL}/payroll/list?${queryParams}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error("Failed to fetch payroll list");
    return response.json();
  }

  async updatePayrollStatus(id: string, status: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/payroll/${id}/status`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error("Failed to update payroll status");
    return response.json();
  }

  async getMyPayslips(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/payroll/my-payslips`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch payslips");
    return response.json();
  }

  // Project Management Methods
  async getProjects(params?: any): Promise<any> {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/projects?${queryParams}`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch projects");
    return response.json();
  }

  async getProjectById(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch project");
    return response.json();
  }

  async createProject(data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create project");
    return response.json();
  }

  async updateProject(id: string, data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update project");
    return response.json();
  }

  // Audit Log Methods

  async clearAuditLogs(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/audit`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to clear audit logs");
    }
  }

  // Task Management Methods
  async getTasks(params?: any): Promise<any> {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/tasks?${queryParams}`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch tasks");
    return response.json();
  }

  async createTask(data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create task");
    return response.json();
  }

  async updateTask(id: string, data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update task");
    return response.json();
  }

  // Employee Management
  async getEmployees(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch employees");
    }
    return response.json();
  }

  async getEmployeeById(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch employee");
    }
    return response.json();
  }

  async createEmployee(data: any): Promise<any> {
    const isFormData = data instanceof FormData;
    const headers = this.getAuthHeaders();
    if (isFormData) {
      delete (headers as any)["Content-Type"];
    }

    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: "POST",
      headers: headers,
      body: isFormData ? data : JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create employee");
    }
    return response.json();
  }

  async updateEmployee(id: string, data: any): Promise<any> {
    const isFormData = data instanceof FormData;
    const headers = this.getAuthHeaders();
    if (isFormData) {
      delete (headers as any)["Content-Type"];
    }

    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: "PUT",
      headers: headers,
      body: isFormData ? data : JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update employee");
    }
    return response.json();
  }

  async getUpcomingEvents(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/employees/upcoming-events`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch upcoming events");
    }
    return response.json();
  }

  async getHierarchy(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/employees/hierarchy`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch hierarchy");
    }
    return response.json();
  }

  // Attendance Methods
  async clockIn(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/attendance/clock-in`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to clock in");
    }
    return response.json();
  }

  async clockOut(completedTasks?: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/attendance/clock-out`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ completedTasks }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to clock out");
    }
    return response.json();
  }

  async startBreak(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/attendance/break-start`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to start break");
    }
    return response.json();
  }

  async endBreak(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/attendance/break-end`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to end break");
    }
    return response.json();
  }

  async getAttendanceStatus(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/attendance/status`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch status");
    return response.json();
  }

  async getAttendanceHistory(params?: any): Promise<any> {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(
      `${API_BASE_URL}/attendance/history?${queryParams}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error("Failed to fetch history");
    return response.json();
  }

  // --- Holiday Management ---
  async getHolidays(year?: number): Promise<any> {
    const query = year ? `?year=${year}` : "";
    const response = await fetch(`${API_BASE_URL}/holidays${query}`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch holidays");
    return response.json();
  }

  async addHoliday(data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/holidays`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to add holiday");
    }
    return response.json();
  }

  async deleteHoliday(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/holidays/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to delete holiday");
    return response.json();
  }

  // Timesheet Methods
  async createTimesheetEntry(data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/timesheet/entry`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create timesheet entry");
    }
    return response.json();
  }

  async getTimesheetEntries(params?: any): Promise<any> {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(
      `${API_BASE_URL}/timesheet/entries?${queryParams}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error("Failed to fetch timesheet entries");
    return response.json();
  }

  async updateTimesheetEntry(id: string, data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/timesheet/entry/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update timesheet entry");
    }
    return response.json();
  }

  async deleteTimesheetEntry(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/timesheet/entry/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to delete timesheet entry");
    return response.json();
  }

  // Time Correction Methods
  async requestTimeCorrection(data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/time-correction/request`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to request correction");
    }
    return response.json();
  }

  async getMyCorrections(): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/time-correction/my-requests`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error("Failed to fetch corrections");
    return response.json();
  }

  async getPendingCorrections(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/time-correction/pending`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch pending corrections");
    return response.json();
  }

  async approveCorrection(id: string, comments?: string): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/time-correction/${id}/approve`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ comments }),
      }
    );
    if (!response.ok) throw new Error("Failed to approve correction");
    return response.json();
  }

  // Notification Methods
  async getNotifications(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch notifications");
    return response.json();
  }

  async markNotificationRead(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to mark notification as read");
    return response.json();
  }

  async rejectCorrection(id: string, comments?: string): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/time-correction/${id}/reject`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ comments }),
      }
    );
    if (!response.ok) throw new Error("Failed to reject correction");
    return response.json();
  }

  async getTeamStatus(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/attendance/team-status`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch team status");
    return response.json();
  }

  // Timesheet Approval Methods
  async submitTimesheets(weekEnding: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/timesheet/submit`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ weekEnding }),
    });
    if (!response.ok) throw new Error("Failed to submit timesheets");
    return response.json();
  }

  async getPendingTimesheetApprovals(): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/timesheet/pending-approvals`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error("Failed to fetch pending approvals");
    return response.json();
  }

  async approveTimesheet(id: string, comments?: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/timesheet/${id}/approve`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ comments }),
    });
    if (!response.ok) throw new Error("Failed to approve timesheet");
    return response.json();
  }

  async rejectTimesheet(id: string, comments: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/timesheet/${id}/reject`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ comments }),
    });
    if (!response.ok) throw new Error("Failed to reject timesheet");
    return response.json();
  }

  // Audit Trail Methods
  async getAuditLogs(filters?: any): Promise<any> {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/audit?${queryParams}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch audit logs");
    }
    return response.json();
  }

  async deleteAuditLog(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/audit/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to delete audit log");
    }
  }

  async getEntityAuditLogs(entityType: string, entityId: string): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/audit/${entityType}/${entityId}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error("Failed to fetch entity audit logs");
    return response.json();
  }
}

export const apiService = new ApiService();
export type { RegisterUserData, ApiResponse };
