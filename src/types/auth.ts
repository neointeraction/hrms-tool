export type Role =
  | "admin"
  | "hr"
  | "accountant"
  | "pm"
  | "employee"
  | "intern"
  | "contractor";

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
