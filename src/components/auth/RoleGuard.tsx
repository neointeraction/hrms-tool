import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { Role } from "../../types/auth";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: Role[];
}

import { menuItems } from "../../utils/navigation";

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-main">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 1. Dynamic Module Access Check
  // Find the menu item corresponding to the current path
  const currentMenuItem = menuItems.find((item) => {
    // Exact match or partial match for sub-routes (if needed, but exact is safer for now unless nested)
    // For simplified matching, assuming exact match for top-level routes
    return (
      item.to === location.pathname ||
      location.pathname.startsWith(item.to + "/")
    );
  });

  if (currentMenuItem && currentMenuItem.module) {
    if (
      user.accessibleModules &&
      user.accessibleModules.includes(currentMenuItem.module)
    ) {
      // User has specific module access, grant access regardless of role
      return <>{children}</>;
    }
  }

  // 2. Fallback to Static Role Check
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
