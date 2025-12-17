import type { Role } from "../types/auth";

export interface MenuItem {
  to: string;
  label: string;
  roles: Role[];
  module?: string;
}

export const menuItems: MenuItem[] = [
  {
    to: "/",
    label: "Dashboard",
    roles: [
      "Admin",
      "HR",
      "Accountant",
      "Project Manager",
      "Employee",
      "Intern",
    ],
  },
  {
    to: "/employee-management",
    label: "Employee Management",
    roles: ["Admin", "HR"],
  },
  {
    to: "/roles",
    label: "Role Management",
    roles: ["Admin", "HR"],
  },
  {
    to: "/designations",
    label: "Designation Management",
    roles: ["Admin", "HR"],
    module: "employees",
  },
  {
    to: "/shifts",
    label: "Shift Management",
    roles: ["Admin", "HR"],
    module: "shifts",
  },
  {
    to: "/settings/documents",
    label: "Document Management",
    roles: ["Admin", "HR"],
    module: "documents",
  },
  {
    to: "/assets",
    label: "Asset Management",
    roles: ["Admin", "HR"],
  },
  {
    to: "/my-assets",
    label: "My Assets",
    roles: [
      "Accountant",
      "Project Manager",
      "Employee",
      "Intern",
      "Consultant",
    ],
  },
  {
    to: "/ai-configuration",
    label: "AI Chatbot Configuration",
    roles: ["Admin", "HR"],
  },
  {
    to: "/attendance",
    label: "Attendance & Time Tracking",
    roles: [
      "Admin",
      "Employee",
      "HR",
      "Project Manager",
      "Intern",
      "Consultant",
    ],
  },
  {
    to: "/audit",
    label: "Audit Trail",
    roles: ["Admin", "HR"],
  },
  {
    to: "/leave",
    label: "Leave Management",
    roles: [
      "Admin",
      "HR",
      "Project Manager",
      "Employee",
      "Intern",
      "Consultant",
    ],
  },
  {
    to: "/payroll",
    label: "Payroll & Finance",
    roles: [
      "Admin",
      "HR",
      "Accountant",
      "Project Manager",
      "Employee",
      "Intern",
      "Consultant",
    ],
  },
  {
    to: "/projects",
    label: "Project Management",
    roles: [
      "Admin",
      "Project Manager",
      "Employee",
      "Intern",
      "Consultant",
      "Accountant",
    ],
  },
  {
    to: "/organization",
    label: "Hierarchy",
    roles: [
      "Admin",
      "HR",
      "Project Manager",
      "Employee",
      "Intern",
      "Consultant",
    ],
  },
  // Super Admin menu items
  {
    to: "/superadmin/analytics",
    label: "Platform Analytics",
    roles: ["Super Admin"],
  },
  {
    to: "/superadmin/tenants",
    label: "Tenant Management",
    roles: ["Super Admin"],
  },
  {
    to: "/superadmin/users",
    label: "User Management",
    roles: ["Super Admin"],
  },
  {
    to: "/superadmin/settings",
    label: "Platform Settings",
    roles: ["Super Admin"],
  },
  {
    to: "/settings",
    label: "System Settings",
    roles: ["Admin"], // Company Admin
  },
  {
    to: "/miscellaneous",
    label: "Miscellaneous",
    roles: [
      "Admin",
      "HR",
      "Accountant",
      "Project Manager",
      "Employee",
      "Intern",
      "Consultant",
    ],
  },
  {
    to: "/social",
    label: "Social Wall",
    roles: [
      "Admin",
      "HR",
      "Accountant",
      "Project Manager",
      "Employee",
      "Intern",
      "Consultant",
    ],
  },
];

/**
 * Get the first accessible route for a given user role
 * @param role - User role
 * @returns First accessible route path, or "/" as fallback
 */
export function getFirstAccessibleRoute(role: Role): string {
  const firstItem = menuItems.find((item) => item.roles.includes(role));
  return firstItem?.to || "/";
}

/**
 * Get all accessible menu items for a given role
 * @param role - User role
 * @returns Array of menu items accessible to the role
 */
export function getAccessibleMenuItems(role: Role): MenuItem[] {
  return menuItems.filter((item) => item.roles.includes(role));
}
