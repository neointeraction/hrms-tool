export type Role =
  | "Admin"
  | "HR"
  | "Accountant"
  | "Project Manager"
  | "Employee"
  | "Intern"
  | "Consultant"
  | "Contractor"
  | "Super Admin"
  | "CEO";

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
        settings?: {
          logo?: string;
          favicon?: string;
          [key: string]: any;
        };
        limits?: {
          maxEmployees: number;
          maxStorage: number;
          enabledModules: string[];
        };
        subscriptionEnd?: string;
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
  permissions?: string[];
  theme?: "light" | "dark";
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
