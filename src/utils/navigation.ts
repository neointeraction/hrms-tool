import type { Role } from "../types/auth";

export interface MenuItem {
  to: string;
  label: string;
  roles: Role[];
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
    to: "/attendance",
    label: "Attendance & Time Tracking",
    roles: ["Employee", "HR", "Project Manager", "Intern", "Consultant"],
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
    roles: ["Admin", "HR", "Accountant", "Employee", "Intern", "Consultant"],
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
