import type { User } from "../types/auth";

// Mock user data store
const MOCK_USERS: Record<string, User> = {
  "admin@sys.com": {
    id: "1",
    name: "Admin User",
    email: "admin@sys.com",
    role: "admin",
    designation: "System Administrator",
    avatar: "AD",
  },
  "hr@company.com": {
    id: "2",
    name: "Sarah Jenkins",
    email: "hr@company.com",
    role: "hr",
    department: "Human Resources",
    designation: "HR Executive",
    avatar: "SJ",
  },
  "acc@company.com": {
    id: "3",
    name: "Mike Ross",
    email: "acc@company.com",
    role: "accountant",
    department: "Finance",
    designation: "Senior Accountant",
    avatar: "MR",
  },
  "pm@company.com": {
    id: "4",
    name: "David Miller",
    email: "pm@company.com",
    role: "pm",
    department: "Engineering",
    designation: "Project Manager",
    avatar: "DM",
  },
  "employee@company.com": {
    id: "5",
    name: "Rohan G",
    email: "employee@company.com",
    role: "employee",
    department: "Design",
    designation: "Product Designer",
    avatar: "RG",
  },
  "intern@company.com": {
    id: "6",
    name: "Emily Chen",
    email: "intern@company.com",
    role: "intern",
    department: "Engineering",
    designation: "Frontend Intern",
    avatar: "EC",
  },
  "contract@company.com": {
    id: "7",
    name: "Alex Freelancer",
    email: "contract@company.com",
    role: "contractor",
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
