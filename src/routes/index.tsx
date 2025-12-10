import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

import EmployeeManagement from "../features/employee/EmployeeManagement";
import RoleGuard from "../components/auth/RoleGuard";

import Login from "../pages/Login";
import CompanySetup from "../pages/CompanySetup";
import Unauthorized from "../pages/Unauthorized";
import Dashboard from "../features/dashboard/Dashboard";
import Profile from "../pages/Profile";
import Attendance from "../features/attendance/Attendance";
import AuditTrail from "../features/admin/AuditTrail";
import LeaveDashboard from "../features/leave/LeaveDashboard";
import PayrollDashboard from "../features/payroll/PayrollDashboard";
import ProjectDashboard from "../features/projects/ProjectDashboard";
import ProjectDetails from "../features/projects/ProjectDetails";
import QAConfig from "../features/admin/QAConfig";
import Organization from "../pages/Organization";
import { TenantList, Analytics } from "../features/superadmin";
import {
  CompanySettings,
  SubscriptionPage,
  UsageDashboard,
} from "../features/settings";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <CompanySetup />,
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
              "Admin",
              "HR",
              "Accountant",
              "Project Manager",
              "Employee",
              "Intern",
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
        path: "ai-configuration",
        element: (
          <RoleGuard allowedRoles={["Admin", "HR"]}>
            <QAConfig />
          </RoleGuard>
        ),
      },
      {
        path: "employee-management",
        element: (
          <RoleGuard allowedRoles={["Admin", "HR"]}>
            <EmployeeManagement />
          </RoleGuard>
        ),
      },
      {
        path: "profile",
        element: (
          <RoleGuard
            allowedRoles={[
              "Admin",
              "HR",
              "Accountant",
              "Project Manager",
              "Employee",
              "Intern",
              "Consultant",
            ]}
          >
            <Profile />
          </RoleGuard>
        ),
      },
      {
        path: "attendance",
        element: (
          <RoleGuard
            allowedRoles={[
              "Employee",
              "HR",
              "Project Manager",
              "Intern",
              "Consultant",
            ]}
          >
            <Attendance />
          </RoleGuard>
        ),
      },
      {
        path: "audit",
        element: (
          <RoleGuard allowedRoles={["Admin", "HR"]}>
            <AuditTrail />
          </RoleGuard>
        ),
      },
      {
        path: "leave",
        element: (
          <RoleGuard
            allowedRoles={[
              "Admin",
              "HR",
              "Project Manager",
              "Employee",
              "Intern",
              "Consultant",
            ]}
          >
            <LeaveDashboard />
          </RoleGuard>
        ),
      },
      {
        path: "payroll",
        element: (
          <RoleGuard
            allowedRoles={[
              "Admin",
              "HR",
              "Accountant",
              "Project Manager",
              "Employee",
              "Intern",
              "Consultant",
            ]}
          >
            <PayrollDashboard />
          </RoleGuard>
        ),
      },
      {
        path: "projects",
        element: (
          <RoleGuard
            allowedRoles={[
              "Admin",
              "Project Manager",
              "Employee",
              "Intern",
              "Consultant",
              "Accountant",
            ]}
          >
            <ProjectDashboard />
          </RoleGuard>
        ),
      },
      {
        path: "projects/:id",
        element: (
          <RoleGuard
            allowedRoles={[
              "Admin",
              "Project Manager",
              "Employee",
              "Intern",
              "Consultant",
            ]}
          >
            <ProjectDetails />
          </RoleGuard>
        ),
      },
      {
        path: "organization",
        element: (
          <RoleGuard
            allowedRoles={[
              "Admin",
              "HR",
              "Project Manager",
              "Employee",
              "Intern",
              "Consultant",
              "Accountant",
            ]}
          >
            <Organization />
          </RoleGuard>
        ),
      },
      // Company Settings Routes (Company Admin)
      {
        path: "/settings/company",
        element: (
          <RoleGuard allowedRoles={["Admin"]}>
            <CompanySettings />
          </RoleGuard>
        ),
      },
      {
        path: "/settings/subscription",
        element: (
          <RoleGuard allowedRoles={["Admin", "HR", "Accountant"]}>
            <SubscriptionPage />
          </RoleGuard>
        ),
      },
      {
        path: "/settings/usage",
        element: (
          <RoleGuard allowedRoles={["Admin", "HR"]}>
            <UsageDashboard />
          </RoleGuard>
        ),
      },
      // Super Admin Routes
      {
        path: "/superadmin/tenants",
        element: (
          <RoleGuard allowedRoles={["Super Admin"]}>
            <TenantList />
          </RoleGuard>
        ),
      },
      {
        path: "/superadmin/analytics",
        element: (
          <RoleGuard allowedRoles={["Super Admin"]}>
            <Analytics />
          </RoleGuard>
        ),
      },
    ],
  },
]);
