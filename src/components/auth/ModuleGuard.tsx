import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface ModuleGuardProps {
  children: ReactNode;
  module: string;
}

export default function ModuleGuard({ children, module }: ModuleGuardProps) {
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

  // Super Admin bypass
  if ((user.role as string) === "Super Admin") {
    return <>{children}</>;
  }

  // Check if accessibleModules contains the required module
  // We enforce this only if accessibleModules is defined on the user object.
  if (user.accessibleModules) {
    if (!user.accessibleModules.includes(module)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}
