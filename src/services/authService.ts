import type { User } from "../types/auth";

// Mock user data store
const MOCK_USERS: Record<string, User> = {
  "admin@sys.com": {
    id: "1",
    name: "Admin User",
    email: "admin@sys.com",
    role: "Admin",
    designation: "System Administrator",
    avatar: "AD",
  },
  "hr@company.com": {
    id: "2",
    name: "Sarah Jenkins",
    email: "hr@company.com",
    role: "HR",
    department: "Human Resources",
    designation: "HR Executive",
    avatar: "SJ",
  },
  "acc@company.com": {
    id: "3",
    name: "Mike Ross",
    email: "acc@company.com",
    role: "Accountant",
    department: "Finance",
    designation: "Senior Accountant",
    avatar: "MR",
  },
  "shameer@neointeraction.com": {
    id: "4",
    name: "Shameer M",
    email: "shameer@neointeraction.com",
    role: "Project Manager",
    department: "Engineering",
    designation: "Project Manager",
    avatar: "SM",
  },
  "liya@neointeraction.com": {
    id: "5",
    name: "Liya V",
    email: "liya@neointeraction.com",
    role: "Employee",
    department: "Design",
    designation: "Product Designer",
    avatar: "LV",
  },
  "intern@company.com": {
    id: "6",
    name: "Emily Chen",
    email: "intern@company.com",
    role: "Intern",
    department: "Engineering",
    designation: "Frontend Intern",
    avatar: "EC",
  },
  "contract@company.com": {
    id: "7",
    name: "Alex Freelancer",
    email: "contract@company.com",
    role: "Consultant",
    department: "Marketing",
    designation: "SEO Consultant",
    avatar: "AF",
  },
};

interface LoginResponse {
  user: User;
  token: string;
}

export const authService = {
  login: async (email: string): Promise<LoginResponse> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const user = MOCK_USERS[email];

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Generate a mock token
    const token = `mock-jwt-token-${user.id}-${Date.now()}`;

    return {
      user,
      token,
    };
  },

  logout: async (): Promise<void> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));
  },
};
