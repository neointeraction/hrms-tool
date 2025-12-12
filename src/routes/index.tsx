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
import UserManagement from "../features/superadmin/UserManagement";
import Settings from "../features/superadmin/Settings";
import {
  CompanySettings,
  SubscriptionPage,
  UsageDashboard,
} from "../features/settings";
import Miscellaneous from "../pages/Miscellaneous";
import Feedback from "../pages/Feedback";
import Appreciation from "../pages/Appreciation";
import EmailAutomation from "../features/email/EmailAutomation";

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
      {
        path: "/superadmin/users",
        element: (
          <RoleGuard allowedRoles={["Super Admin"]}>
            <UserManagement />
          </RoleGuard>
        ),
      },
      {
        path: "/superadmin/settings",
        element: (
          <RoleGuard allowedRoles={["Super Admin"]}>
            <Settings />
          </RoleGuard>
        ),
      },
      {
        path: "miscellaneous",
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
            <Miscellaneous />
          </RoleGuard>
        ),
      },
      {
        path: "miscellaneous/feedback",
        element: (
          <RoleGuard
            allowedRoles={[
              "HR",
              "Accountant",
              "Project Manager",
              "Employee",
              "Intern",
              "Consultant",
            ]}
          >
            <Feedback />
          </RoleGuard>
        ),
      },
      {
        path: "miscellaneous/appreciation",
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
            <Appreciation />
          </RoleGuard>
        ),
      },
      {
        path: "miscellaneous/email-automation",
        element: (
          <RoleGuard allowedRoles={["Admin", "HR"]}>
            <EmailAutomation />
          </RoleGuard>
        ),
      },
    ],
  },
]);
