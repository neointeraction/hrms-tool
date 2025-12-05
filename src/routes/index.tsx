import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

import EmployeeManagement from "../features/employee/EmployeeManagement";
import RoleGuard from "../components/auth/RoleGuard";

import Login from "../pages/Login";
import Unauthorized from "../pages/Unauthorized";
import Dashboard from "../features/dashboard/Dashboard";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <RoleGuard
            allowedRoles={[
              "admin",
              "hr",
              "accountant",
              "pm",
              "employee",
              "intern",
            ]}
          >
            <Dashboard />
          </RoleGuard>
        ),
      },
      {
        index: true,
        element: <Navigate to="/" replace />,
      },

      {
        path: "employee-management",
        element: (
          <RoleGuard allowedRoles={["admin", "hr"]}>
            <EmployeeManagement />
          </RoleGuard>
        ),
      },
    ],
  },
]);
