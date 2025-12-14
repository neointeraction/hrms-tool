export type Role =
  | "Admin"
  | "HR"
  | "Accountant"
  | "Project Manager"
  | "Employee"
  | "Intern"
  | "Consultant"
  | "Super Admin"
  | "Super Admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  roles?: Role[];
  avatar?: string;
  tenantId?:
    | string
    | {
        _id: string;
        companyName: string;
        status?: string;
        limits?: {
          maxEmployees: number;
          maxStorage: number;
          enabledModules: string[];
        };
      }
    | null;
  companyName?: string; // Derived field
  isSuperAdmin?: boolean;
  isCompanyAdmin?: boolean;
  department?: string;
  designation?: string;
  employeeId?: string;
  doj?: string;
  pan?: string;
  bankName?: string;
  bankAccountNo?: string;
  accessibleModules?: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
