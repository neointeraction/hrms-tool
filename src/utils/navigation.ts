import type { User, Role } from "../types/auth";

export interface MenuItem {
  to: string;
  label: string;
  roles?: Role[]; // Kept for backward compat / specific overrides (like Super Admin)
  module?: string;
  permissions?: string[];
  anyOfModules?: string[]; // Show if user has ANY of these modules
  icon?: any;
}

export const menuItems: MenuItem[] = [
  {
    to: "/",
    label: "Dashboard",
    // Dashboard is generally accessible to all authenticated users.
  },
  {
    to: "/my-journey",
    label: "My Journey",
    module: "my_journey", // New module key
  },
  {
    to: "/employee-management",
    label: "Employee Management",
    module: "employees",
  },
  {
    to: "/roles",
    label: "Role Management",
    module: "roles",
  },
  {
    to: "/designations",
    label: "Designation Management",
    module: "designations",
  },
  {
    to: "/shifts",
    label: "Shift Management",
    module: "shifts",
  },
  {
    to: "/settings/documents",
    label: "Document Management",
    module: "documents",
  },
  {
    to: "/assets",
    label: "Asset Management",
    module: "assets",
  },
  {
    to: "/my-assets",
    label: "My Assets",
    module: "assets", // Usually all employees have this if assets module is enabled
  },
  {
    to: "/ai-configuration",
    label: "AI Chatbot Configuration",
    module: "ai_chatbot",
  },
  {
    to: "/attendance",
    label: "Attendance & Time Tracking",
    module: "attendance",
  },
  {
    to: "/audit",
    label: "Audit Trail",
    module: "audit",
  },
  {
    to: "/leave",
    label: "Leave Management",
    module: "leave",
  },
  {
    to: "/payroll",
    label: "Payroll & Finance",
    module: "payroll",
  },
  {
    to: "/clients",
    label: "Client Management",
    module: "clients",
  },
  {
    to: "/projects",
    label: "Project Management",
    module: "projects",
  },
  {
    to: "/organization",
    label: "Hierarchy",
    module: "organization",
  },
  // Super Admin menu items - these usually don't map to tenant modules
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
    roles: ["Admin"], // Only Admin can access System Settings
  },
  {
    to: "/miscellaneous",
    label: "Miscellaneous",
    // Accessible to all, sub-items filtered by their own modules
    anyOfModules: ["feedback", "appreciation", "email_automation"],
  },
  {
    to: "/social",
    label: "Social Wall",
    module: "social",
  },
  {
    to: "/resignation/submit",
    label: "My Resignation",
    module: "employees", // Part of employee lifecycle - Keep as employees or move to exit_management for strict control?
    // Usually 'submit' is for everyone (Employee module), 'manage' is for HR/Manager (Exit Management).
  },
  {
    to: "/resignation/manage",
    label: "Exit Management",
    module: "exit_management",
  },
  {
    to: "/help",
    label: "Help",
    module: "help",
  },
];

/**
 * Get the first accessible route for a given user
 * @param user - User object
 * @returns First accessible route path, or "/" as fallback
 */
export function getFirstAccessibleRoute(user: User): string {
  // Super Admin specific default route
  if (user.role === "Super Admin") {
    return "/superadmin/analytics";
  }

  const accessibleItems = getAccessibleMenuItems(user);
  return accessibleItems[0]?.to || "/";
}

/**
 * Get all accessible menu items for a given user
 * @param user - User object
 * @returns Array of menu items accessible to the user
 */
export function getAccessibleMenuItems(user: User): MenuItem[] {
  if (!user) return [];

  // Super Admin bypass
  if (user.role === "Super Admin") {
    return menuItems;
  }

  return menuItems.filter((item) => {
    // 1. Check Module Access (Single)
    if (item.module) {
      if (
        user.accessibleModules &&
        !user.accessibleModules.includes(item.module)
      ) {
        return false;
      }
    }

    // 2. Check Any of Modules (Multiple)
    if (item.anyOfModules && item.anyOfModules.length > 0) {
      if (!user.accessibleModules) return false;
      const hasAny = item.anyOfModules.some((m) =>
        user.accessibleModules!.includes(m)
      );
      if (!hasAny) return false;
    }

    // 3. Check Permissions
    if (item.permissions && item.permissions.length > 0) {
      if (!user.permissions) return false;
      // User must have ALL permissions listed? Or ANY?
      // Typically nav item requires *a* capability. Let's assume ANY for now if multiple listed, or match strict.
      // Usually "view" permission is enough.
      // Let's go with: User must have AT LEAST ONE of the required permissions to see the menu.
      const hasPermission = item.permissions.some((p) =>
        user.permissions!.includes(p)
      );
      if (!hasPermission) return false;
    }

    // 4. Fallback / Specific Role Overrides
    // If an item has explicit roles defined (e.g. "System Settings" for Admin), logic is strict.
    // Since we removed roles from general items (like Dashboard) and module-based items,
    // presence of 'roles' implies a strict role-based restriction.
    if (item.roles && item.roles.length > 0) {
      if (!item.roles.includes(user.role)) {
        return false;
      }
    }

    return true;
  });
}
