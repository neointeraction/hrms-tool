export type Role =
  | "Admin"
  | "HR"
  | "Accountant"
  | "Project Manager"
  | "Employee"
  | "Intern"
  | "Consultant";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  department?: string;
  designation?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
