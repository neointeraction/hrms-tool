// const API_BASE_URL = "http://localhost:5001/api";
// export const ASSET_BASE_URL = "http://localhost:5001";

export const API_BASE_URL = "https://hrms-backend-sand.vercel.app/api";
export const ASSET_BASE_URL = "https://hrms-backend-sand.vercel.app";

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
    console.log("[ApiService Debug] getAuthHeaders. Token found:", !!token);
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

  async getEmployeesOnLeave(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/leave/active`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch employees on leave");
    return response.json();
  }

  // Super Admin - Tenant Management
  async getAllTenants(params?: any): Promise<any> {
    const queryParams = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    const response = await fetch(
      `${API_BASE_URL}/superadmin/tenants${queryParams}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error("Failed to fetch tenants");
    return response.json();
  }

  async createTenant(data: any): Promise<any> {
    const isFormData = data instanceof FormData;
    const body = isFormData ? data : JSON.stringify(data);
    const headers = this.getAuthHeaders();
    if (isFormData) {
      // @ts-ignore
      delete headers["Content-Type"]; // Let browser set boundary for FormData
    }

    const response = await fetch(`${API_BASE_URL}/superadmin/tenants`, {
      method: "POST",
      headers,
      body,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create tenant");
    }
    return response.json();
  }

  async updateTenant(id: string, data: any): Promise<any> {
    const isFormData = data instanceof FormData;
    const body = isFormData ? data : JSON.stringify(data);
    const headers = this.getAuthHeaders();
    if (isFormData) {
      // @ts-ignore
      delete headers["Content-Type"]; // Let browser set boundary for FormData
    }

    const response = await fetch(`${API_BASE_URL}/superadmin/tenants/${id}`, {
      method: "PATCH",
      headers,
      body,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update tenant");
    }
    return response.json();
  }

  async deleteTenant(tenantId: string): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/tenants/${tenantId}`,
      {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error("Failed to delete tenant");
    return response.json();
  }

  async updateTenantStatus(tenantId: string, status: string): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/tenants/${tenantId}/status`,
      {
        method: "PATCH",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status }),
      }
    );
    if (!response.ok) throw new Error("Failed to update tenant status");
    return response.json();
  }

  async getPlatformAnalytics(): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/analytics/overview`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error("Failed to fetch analytics");
    return response.json();
  }

  async registerCompany(data: any): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/registration/register-company`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to register company");
    }
    return response.json();
  }

  // Company Settings
  async getCompanySettings(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/settings/company`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch company settings");
    return response.json();
  }

  async getSubscriptionDetails(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/settings/subscription`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch subscription");
    return response.json();
  }

  async getUsageAnalytics(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/settings/usage`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch usage analytics");
    return response.json();
  }

  // Super Admin Methods
  async getAllGlobalUsers(params?: any): Promise<any[]> {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/superadmin/users?${query}`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch global users");
    return response.json();
  }

  async updateGlobalUserStatus(userId: string, status: string): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/users/${userId}/status`,
      {
        method: "PATCH",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status }),
      }
    );
    if (!response.ok) throw new Error("Failed to update user status");
    return response.json();
  }

  async deleteGlobalUser(userId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/superadmin/users/${userId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to delete user");
    }
    return response.json();
  }

  async updateProfile(data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update profile");
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

  // AI
  async getAIConfig(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/ai/config`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch AI config");
    return response.json();
  }

  // Feedback
  async getMyFeedbacks(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/feedback/my`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch feedbacks");
    return response.json();
  }

  async createFeedback(data: {
    recipientId: string;
    message: string;
  }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/feedback`, {
      method: "POST",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to send feedback");
    }
    return response.json();
  }

  async getRoles(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/admin/roles`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch roles");
    return response.json();
  }

  async createUser(userData: any): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create user");
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
  async createRole(data: {
    name: string;
    permissions?: string[];
    accessibleModules?: string[];
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
    data: {
      name?: string;
      permissions?: string[];
      accessibleModules?: string[];
    }
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

  // Asset Categories
  async getAssetCategories(includeInactive = false): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/asset-categories?includeInactive=${includeInactive}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch asset categories");
    }

    return response.json();
  }

  async createAssetCategory(data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/asset-categories`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create asset category");
    }

    return response.json();
  }

  async updateAssetCategory(id: string, data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/asset-categories/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update asset category");
    }

    return response.json();
  }

  async deleteAssetCategory(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/asset-categories/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete asset category");
    }

    return response.json();
  }

  async toggleAssetCategoryStatus(id: string): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/asset-categories/${id}/toggle-status`,
      {
        method: "PATCH",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || "Failed to toggle asset category status"
      );
    }

    return response.json();
  }

  // Assets
  async getAssets(params?: any): Promise<any> {
    const queryString = params
      ? "?" + new URLSearchParams(params).toString()
      : "";
    const response = await fetch(`${API_BASE_URL}/assets${queryString}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch assets");
    }

    return response.json();
  }

  async createAsset(data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/assets`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create asset");
    }

    return response.json();
  }

  async updateAsset(id: string, data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/assets/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update asset");
    }

    return response.json();
  }

  async deleteAsset(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/assets/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete asset");
    }

    return response.json();
  }

  async getAssetStats(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/assets/stats`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch asset statistics");
    }

    return response.json();
  }

  async uploadAssetInvoice(id: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append("invoice", file);

    const token = localStorage.getItem("authToken");
    const response = await fetch(
      `${API_BASE_URL}/assets/${id}/upload-invoice`,
      {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to upload invoice");
    }

    return response.json();
  }

  async disposeAsset(id: string, data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/assets/${id}/dispose`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to dispose asset");
    }

    return response.json();
  }

  // Asset Assignments
  async assignAsset(data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/asset-assignments/assign`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to assign asset");
    }

    return response.json();
  }

  async acknowledgeAsset(assignmentId: string): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/asset-assignments/${assignmentId}/acknowledge`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to acknowledge asset");
    }

    return response.json();
  }

  async returnAsset(assignmentId: string, data: any): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/asset-assignments/${assignmentId}/return`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to return asset");
    }

    return response.json();
  }

  async getMyAssets(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/asset-assignments/employee`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch assigned assets");
    }

    return response.json();
  }

  async getAssetAssignments(params?: any): Promise<any> {
    const queryString = params
      ? "?" + new URLSearchParams(params).toString()
      : "";
    const response = await fetch(
      `${API_BASE_URL}/asset-assignments${queryString}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch asset assignments");
    }

    return response.json();
  }

  // Asset Incidents
  async reportAssetIncident(data: any, photos?: File[]): Promise<any> {
    const formData = new FormData();

    // Append data fields
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    // Append photos
    if (photos && photos.length > 0) {
      photos.forEach((photo) => {
        formData.append("photos", photo);
      });
    }

    const token = localStorage.getItem("authToken");
    const response = await fetch(`${API_BASE_URL}/asset-incidents/report`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to report incident");
    }

    return response.json();
  }

  async getAssetIncidents(params?: any): Promise<any> {
    const queryString = params
      ? "?" + new URLSearchParams(params).toString()
      : "";
    const response = await fetch(
      `${API_BASE_URL}/asset-incidents${queryString}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch incidents");
    }

    return response.json();
  }

  async resolveAssetIncident(id: string, data: any): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/asset-incidents/${id}/resolve`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to resolve incident");
    }

    return response.json();
  }

  // Asset History
  async getAssetHistory(assetId: string): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/asset-history/asset/${assetId}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch asset history");
    }

    return response.json();
  }

  async getAllAssetHistory(params?: any): Promise<any> {
    const queryString = params
      ? "?" + new URLSearchParams(params).toString()
      : "";
    const response = await fetch(
      `${API_BASE_URL}/asset-history${queryString}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch history logs");
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

  async updateCompanySettings(data: any): Promise<any> {
    const isFormData = data instanceof FormData;
    const headers = this.getAuthHeaders();
    if (isFormData) {
      delete (headers as any)["Content-Type"]; // Let browser set Content-Type with boundary
    }

    const response = await fetch(`${API_BASE_URL}/settings/company`, {
      method: "PUT",
      headers: headers,
      body: isFormData ? data : JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update settings");
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

  // AI Chatbot
  async getPolicyStatus(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/ai/policy-status`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch policy status");
    return response.json();
  }

  async uploadPolicy(files: File[] | FileList): Promise<any> {
    const formData = new FormData();
    // Convert FileList to array if needed
    const fileArray = Array.from(files);

    fileArray.forEach((file) => {
      formData.append("policyFiles", file);
    });

    const headers = this.getAuthHeaders();
    delete (headers as any)["Content-Type"]; // Let browser set boundary

    const response = await fetch(`${API_BASE_URL}/ai/upload-policy`, {
      method: "POST",
      headers: headers,
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to upload policy");
    }
    return response.json();
  }

  async deletePolicy(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/ai/policy/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete policy");
    }

    return response.json();
  }

  async askAi(question: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ question }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to get AI response");
    }
    return response.json();
  }

  // Badge & Appreciation
  async getBadges(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/badges`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch badges");
    return response.json();
  }

  async createBadge(data: FormData): Promise<any> {
    // Note: createBadge expects FormData because of file upload
    const headers = this.getAuthHeaders();
    delete (headers as any)["Content-Type"]; // Let browser set boundary

    const response = await fetch(`${API_BASE_URL}/badges`, {
      method: "POST",
      headers: headers,
      body: data,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create badge");
    }
    return response.json();
  }

  async deleteBadge(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/badges/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to delete badge");
    return response.json();
  }

  async getAppreciations(params?: { recipientId?: string }): Promise<any[]> {
    const queryParams =
      params && params.recipientId ? `?recipientId=${params.recipientId}` : "";
    const response = await fetch(`${API_BASE_URL}/appreciation${queryParams}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch appreciations");
    return response.json();
  }

  async createAppreciation(data: {
    recipientId: string;
    badgeId: string;
    message?: string;
  }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/appreciation`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to send appreciation");
    }
    return response.json();
  }
  async updateBadge(id: string, formData: FormData) {
    const token = localStorage.getItem("authToken");

    const response = await fetch(`${API_BASE_URL}/badges/${id}`, {
      method: "PUT",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update badge");
    }

    return response.json();
  }

  async getHRLeaveOverview(filters: any) {
    const token = localStorage.getItem("hrms_token");
    const queryParams = new URLSearchParams();

    Object.keys(filters).forEach((key) => {
      if (filters[key]) queryParams.append(key, filters[key]);
    });

    const response = await fetch(
      `${API_BASE_URL}/leave/hr-overview?${queryParams.toString()}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch HR leave overview");
    }

    return response.json();
  }

  // Email Automation
  async getEmailSettings(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/email-automation/settings`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch email settings: ${response.status} ${errorText}`
      );
    }
    return response.json();
  }

  async updateEmailSettings(data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/email-automation/settings`, {
      method: "PUT",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update email settings");
    return response.json();
  }

  async triggerEmailAutomation(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/email-automation/trigger`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to trigger email automation");
    return response.json();
  }

  async getEmailAuditLogs(): Promise<any[]> {
    const response = await fetch(
      `${API_BASE_URL}/email-automation/audit-logs`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error("Failed to fetch audit logs");
    return response.json();
  }
  // Social Wall
  async getSocialFeed(params?: any): Promise<any> {
    const queryString = params
      ? "?" + new URLSearchParams(params).toString()
      : "";
    const response = await fetch(`${API_BASE_URL}/social/feed${queryString}`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch social feed");
    return response.json();
  }

  async createPost(data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/social/posts`, {
      method: "POST",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create post");
    return response.json();
  }

  async updatePost(postId: string, content: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/social/posts/${postId}`, {
      method: "PUT",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update post");
    }
    return response.json();
  }

  async deletePost(postId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/social/posts/${postId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to delete post");
    return response.json();
  }

  async toggleReaction(id: string, type: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/social/posts/${id}/react`, {
      method: "POST",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type }),
    });
    if (!response.ok) throw new Error("Failed to toggle reaction");
    return response.json();
  }

  async votePoll(id: string, optionIndex: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/social/posts/${id}/vote`, {
      method: "POST",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ optionIndex }),
    });
    if (!response.ok) throw new Error("Failed to vote");
    return response.json();
  }

  async getComments(id: string): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/social/posts/${id}/comments`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error("Failed to fetch comments");
    return response.json();
  }

  async addComment(
    id: string,
    content: string,
    parentId?: string
  ): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/social/posts/${id}/comments`,
      {
        method: "POST",
        headers: {
          ...this.getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, parentId }),
      }
    );
    if (!response.ok) throw new Error("Failed to add comment");
    return response.json();
  }

  async toggleCommentReaction(commentId: string, type: string): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/social/comments/${commentId}/react`,
      {
        method: "POST",
        headers: {
          ...this.getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to toggle comment reaction");
    }
    return response.json();
  }

  async uploadSocialMedia(file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("authToken");

    const response = await fetch(`${API_BASE_URL}/social/upload-media`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to upload media");
    return response.json();
  }

  async checkNewSocialPosts(lastChecked: string): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/social/check-new?lastChecked=${lastChecked}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error("Failed to check new posts");
    return response.json();
  }
}

export const apiService = new ApiService();
export type { RegisterUserData, ApiResponse };
