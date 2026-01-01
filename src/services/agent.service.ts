import { API_BASE_URL } from "./api.service";

export interface AgentResponse {
  answer?: string;
  actions?: Array<{
    tool: string;
    status: "success" | "error";
    output: any;
    error?: string;
  }>;
}

class AgentService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("authToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async executeCommand(command: string): Promise<AgentResponse> {
    const response = await fetch(`${API_BASE_URL}/ai/agent`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ command }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to execute agent command");
    }

    return response.json();
  }
}

export const agentService = new AgentService();
