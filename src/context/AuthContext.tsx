import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User, AuthState } from "../types/auth";
import { apiService } from "../services/api.service";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
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
      } catch (error) {
        console.error("Failed to parse stored user", error);
        localStorage.removeItem("hrms_user");
        localStorage.removeItem("hrms_token");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Try API login first
      const response = await apiService.login(email, password);

      // The API returns a token, we need to fetch user data
      const userData = await apiService.getCurrentUser();

      const user: User = {
        id: userData.user._id,
        email: userData.user.email,
        name: userData.user.email.split("@")[0], // Extract name from email for now
        role: userData.user.roles[0] || "employee",
        department: userData.user.department,
        designation: userData.user.employeeId,
        avatar: userData.user.email.substring(0, 2).toUpperCase(),
      };

      setUser(user);
      setIsAuthenticated(true);

      // Persist session
      localStorage.setItem("hrms_user", JSON.stringify(user));
      if (response.token) {
        localStorage.setItem("hrms_token", response.token);
      }

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
        role: "admin",
        department: "IT",
        designation: "System Administrator",
        avatar: "SA",
      },
      "hr@company.com": {
        id: "hr-1",
        email: "hr@company.com",
        name: "HR Executive",
        role: "hr",
        department: "Human Resources",
        designation: "HR Executive",
        avatar: "HR",
      },
      "pm@company.com": {
        id: "pm-1",
        email: "pm@company.com",
        name: "Project Manager",
        role: "pm",
        department: "Engineering",
        designation: "Project Manager",
        avatar: "PM",
      },
      "employee@company.com": {
        id: "emp-1",
        email: "employee@company.com",
        name: "John Employee",
        role: "employee",
        department: "Engineering",
        designation: "Software Engineer",
        avatar: "JE",
      },
      "acc@company.com": {
        id: "acc-1",
        email: "acc@company.com",
        name: "Accountant",
        role: "accountant",
        department: "Finance",
        designation: "Senior Accountant",
        avatar: "AC",
      },
      "intern@company.com": {
        id: "int-1",
        email: "intern@company.com",
        name: "Intern",
        role: "intern",
        department: "Engineering",
        designation: "Software Intern",
        avatar: "IN",
      },
      "contract@company.com": {
        id: "con-1",
        email: "contract@company.com",
        name: "Contractor",
        role: "contractor",
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
