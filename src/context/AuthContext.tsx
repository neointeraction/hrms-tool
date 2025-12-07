import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User, AuthState, Role } from "../types/auth";
import { apiService } from "../services/api.service";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for persisted user session
    const storedUser = localStorage.getItem("hrms_user");
    const storedToken = localStorage.getItem("hrms_token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
        // Fetch fresh data from server to ensure avatar and details are up to date
        // We define refreshUser below, but we can call it here if we move it or use a separate internal function
        // To avoid hoisting issues or define-before-use, we'll verify if we can call it.
        // Actually, best to just call the API directly or ensure refreshUser is defined/hoisted or use a separate effect.
        // Since refreshUser is defined inside the component, we can call it.
      } catch (error) {
        console.error("Failed to parse stored user", error);
        localStorage.removeItem("hrms_user");
        localStorage.removeItem("hrms_token");
      }
    }
    setIsLoading(false);
  }, []);

  // Define refreshUser first or move it up? Function declarations are hoisted if using `function`, but const lambdas are not.
  // We will move refreshUser up or use a separate effect for refreshing.
  // Let's modify the login and refreshUser logic first.

  // Normalize role names from API (handles old lowercase names)
  const normalizeRole = (apiRole: string): Role => {
    const roleMap: Record<string, Role> = {
      admin: "Admin",
      hr: "HR",
      accountant: "Accountant",
      pm: "Project Manager",
      employee: "Employee",
      intern: "Intern",
      contractor: "Consultant",
      consultant: "Consultant",
    };

    // If it's already capitalized, return as-is
    if (Object.values(roleMap).includes(apiRole as Role)) {
      return apiRole as Role;
    }

    // Otherwise map from lowercase to capitalized
    return roleMap[apiRole.toLowerCase()] || "Employee";
  };

  const refreshUser = async () => {
    try {
      const userData = await apiService.getCurrentUser();
      const apiUser = userData.user;

      const updatedUser: User = {
        id: apiUser._id,
        email: apiUser.email,
        name: apiUser.name || apiUser.email.split("@")[0],
        role: normalizeRole(
          apiUser.roles[0]?.name || apiUser.roles[0] || "employee"
        ),
        department: apiUser.department,
        designation: apiUser.designation || apiUser.employeeId,
        avatar: apiUser.avatar || apiUser.email.substring(0, 2).toUpperCase(),
      };

      setUser(updatedUser);
      localStorage.setItem("hrms_user", JSON.stringify(updatedUser)); // Update storage
      return updatedUser;
    } catch (error) {
      console.error("Failed to refresh user data", error);
      return null;
    }
  };

  // Add a separate effect to refresh user on mount if authenticated
  useEffect(() => {
    if (localStorage.getItem("hrms_token")) {
      refreshUser();
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Try API login first
      const response = await apiService.login(email, password);

      // Store token immediately so subsequent requests authenticate
      if (response.token) {
        localStorage.setItem("hrms_token", response.token);
      }

      // The API returns a token, we need to fetch user data
      const userData = await apiService.getCurrentUser();

      const user: User = {
        id: userData.user._id,
        email: userData.user.email,
        name: userData.user.email.split("@")[0], // Extract name from email for now
        role: normalizeRole(
          userData.user.roles[0]?.name || userData.user.roles[0] || "employee"
        ),
        department: userData.user.department,
        designation: userData.user.employeeId,
        // Use avatar from backend if available
        avatar:
          userData.user.avatar ||
          userData.user.email.substring(0, 2).toUpperCase(),
      };

      setUser(user);
      setIsAuthenticated(true);

      // Persist session
      localStorage.setItem("hrms_user", JSON.stringify(user));

      return user;
    } catch (error) {
      console.error("API login failed, trying dummy credentials...", error);

      // Fallback to dummy credentials
      const dummyUser = authenticateWithDummyCredentials(email, password);
      if (dummyUser) {
        setUser(dummyUser);
        setIsAuthenticated(true);

        // Persist session
        localStorage.setItem("hrms_user", JSON.stringify(dummyUser));
        localStorage.setItem("hrms_token", "dummy-token");

        return dummyUser;
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  console.log(user, "user");

  // Dummy credentials fallback
  const authenticateWithDummyCredentials = (
    email: string,
    _password: string
  ): User | null => {
    // Accept any password for demo purposes
    const dummyUsers: Record<string, User> = {
      "admin@sys.com": {
        id: "admin-1",
        email: "admin@sys.com",
        name: "System Admin",
        role: "Admin",
        department: "IT",
        designation: "System Administrator",
        avatar: "SA",
      },
      "hr@company.com": {
        id: "hr-1",
        email: "hr@company.com",
        name: "HR Executive",
        role: "HR",
        department: "Human Resources",
        designation: "HR Executive",
        avatar: "HR",
      },
      "pm@company.com": {
        id: "pm-1",
        email: "pm@company.com",
        name: "Project Manager",
        role: "Project Manager",
        department: "Engineering",
        designation: "Project Manager",
        avatar: "PM",
      },
      "employee@company.com": {
        id: "emp-1",
        email: "employee@company.com",
        name: "John Employee",
        role: "Employee",
        department: "Engineering",
        designation: "Software Engineer",
        avatar: "JE",
      },
      "acc@company.com": {
        id: "acc-1",
        email: "acc@company.com",
        name: "Accountant",
        role: "Accountant",
        department: "Finance",
        designation: "Senior Accountant",
        avatar: "AC",
      },
      "intern@company.com": {
        id: "int-1",
        email: "intern@company.com",
        name: "Intern",
        role: "Intern",
        department: "Engineering",
        designation: "Software Intern",
        avatar: "IN",
      },
      "contract@company.com": {
        id: "con-1",
        email: "contract@company.com",
        name: "Contractor",
        role: "Consultant",
        department: "Engineering",
        designation: "Contract Developer",
        avatar: "CO",
      },
    };

    return dummyUsers[email.toLowerCase()] || null;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("hrms_user");
    localStorage.removeItem("hrms_token");
    localStorage.removeItem("authToken"); // Also remove the API token
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
