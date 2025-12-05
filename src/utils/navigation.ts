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
    roles: ["admin", "hr", "accountant", "pm", "employee", "intern"],
  },
  {
    to: "/user-management",
    label: "User Management",
    roles: ["admin"],
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
