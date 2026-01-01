import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import OnboardingLayout from "../layouts/OnboardingLayout";
import OnboardingWizard from "../pages/onboarding/OnboardingWizard";

import EmployeeManagement from "../features/employee/EmployeeManagement";
import RoleGuard from "../components/auth/RoleGuard";
import ModuleGuard from "../components/auth/ModuleGuard";

import Login from "../pages/Login";
import CompanySetup from "../pages/CompanySetup";
import Unauthorized from "../pages/Unauthorized";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Dashboard from "../features/dashboard/Dashboard";
// Removed wrapper as logic moved to Dashboard.tsx

import Profile from "../pages/Profile";
import Attendance from "../features/attendance/Attendance";
import AuditTrail from "../features/admin/AuditTrail";
import LeaveDashboard from "../features/leave/LeaveDashboard";
import PayrollDashboard from "../features/payroll/PayrollDashboard";
import ResignationSubmission from "../features/resignation/components/ResignationSubmission";
import ResignationManagement from "../features/resignation/components/ResignationManagement";
import ClientList from "../features/clients/ClientList";
import ProjectDashboard from "../features/projects/ProjectDashboard";
import ProjectDetails from "../features/projects/ProjectDetails";
import QAConfig from "../features/admin/QAConfig";
import Organization from "../pages/Organization";
import { TenantList, Analytics } from "../features/superadmin";
import RoleManagement from "../features/admin/RoleManagement";
import DesignationManagement from "../features/admin/DesignationManagement";
import ShiftManagement from "../features/admin/ShiftManagement";
import UserManagement from "../features/superadmin/UserManagement";
import SuperAdminSettings from "../features/superadmin/Settings";
import {
  CompanySettings,
  SubscriptionPage,
  UsageDashboard,
  DocumentSettings,
} from "../features/settings";
import Miscellaneous from "../pages/Miscellaneous";
import Feedback from "../pages/Feedback";
import Appreciation from "../pages/Appreciation";
import EmailAutomation from "../features/email/EmailAutomation";
import AssetCategories from "../features/assets/pages/AssetCategories";
import AssetInventory from "../features/assets/pages/AssetInventory";
import MyAssets from "../features/assets/pages/MyAssets";
import AssetDashboard from "../features/assets/pages/AssetDashboard";
import SocialFeed from "../features/social/SocialFeed";
import MyJourney from "../pages/MyJourney";
import Help from "../pages/Help";

// Settings
import SystemSettings from "../pages/admin/SystemSettings";
import Landing from "../pages/Landing";

export const router = createBrowserRouter([
  {
    path: "/landing",
    element: <Landing />,
  },
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
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password/:token",
    element: <ResetPassword />,
  },
  {
    path: "/onboarding",
    element: <OnboardingLayout />,
    children: [
      {
        path: "start/:token",
        element: <OnboardingWizard />,
      },
    ],
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
              "CEO",
            ]}
          >
            <Dashboard />
          </RoleGuard>
        ),
      },
      // Resignation Routes
      {
        path: "resignation/submit",
        element: (
          <RoleGuard
            allowedRoles={[
              "Employee",
              "Admin",
              "HR",
              "Project Manager",
              "Contractor",
              "Intern",
              "Accountant",
            ]}
          >
            <ResignationSubmission />
          </RoleGuard>
        ),
      },
      {
        path: "resignation/manage",
        element: (
          <RoleGuard allowedRoles={["Admin", "HR", "Project Manager"]}>
            <ResignationManagement />
          </RoleGuard>
        ),
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
      {
        path: "ai-configuration",
        element: (
          <RoleGuard allowedRoles={["Admin", "HR"]}>
            <ModuleGuard module="ai_chatbot">
              <QAConfig />
            </ModuleGuard>
          </RoleGuard>
        ),
      },
      {
        path: "employee-management",
        element: (
          <ModuleGuard module="employees">
            <EmployeeManagement />
          </ModuleGuard>
        ),
      },
      {
        path: "roles",
        element: (
          <ModuleGuard module="roles">
            <RoleManagement />
          </ModuleGuard>
        ),
      },
      {
        path: "designations",
        element: (
          <ModuleGuard module="employees">
            <DesignationManagement />
          </ModuleGuard>
        ),
      },
      {
        path: "shifts",
        element: (
          <ModuleGuard module="shifts">
            <ShiftManagement />
          </ModuleGuard>
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
        path: "my-journey",
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
            <ModuleGuard module="my_journey">
              <MyJourney />
            </ModuleGuard>
          </RoleGuard>
        ),
      },
      {
        path: "attendance",
        element: (
          <RoleGuard
            allowedRoles={[
              "Admin",
              "Employee",
              "HR",
              "Project Manager",
              "Intern",
              "Consultant",
            ]}
          >
            <ModuleGuard module="attendance">
              <Attendance />
            </ModuleGuard>
          </RoleGuard>
        ),
      },
      {
        path: "audit",
        element: (
          <ModuleGuard module="audit">
            <AuditTrail />
          </ModuleGuard>
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
            <ModuleGuard module="leave">
              <LeaveDashboard />
            </ModuleGuard>
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
            <ModuleGuard module="payroll">
              <PayrollDashboard />
            </ModuleGuard>
          </RoleGuard>
        ),
      },
      {
        path: "clients",
        element: (
          <RoleGuard allowedRoles={["Admin", "HR", "Project Manager"]}>
            <ModuleGuard module="clients">
              <ClientList />
            </ModuleGuard>
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
            <ModuleGuard module="projects">
              <ProjectDashboard />
            </ModuleGuard>
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
            <ModuleGuard module="projects">
              <ProjectDetails />
            </ModuleGuard>
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
            <ModuleGuard module="organization">
              <Organization />
            </ModuleGuard>
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
        path: "/settings/documents",
        element: (
          <RoleGuard allowedRoles={["Admin", "HR"]}>
            <ModuleGuard module="documents">
              <DocumentSettings />
            </ModuleGuard>
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
            <SuperAdminSettings />
          </RoleGuard>
        ),
      },
      // Company Admin Settings
      {
        path: "settings",
        element: (
          <RoleGuard allowedRoles={["Admin"]}>
            <SystemSettings />
          </RoleGuard>
        ),
      },
      {
        path: "social",
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
              "CEO",
            ]}
          >
            <ModuleGuard module="social">
              <SocialFeed />
            </ModuleGuard>
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
              "Admin",
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
            <ModuleGuard module="appreciation">
              <Appreciation />
            </ModuleGuard>
          </RoleGuard>
        ),
      },
      {
        path: "miscellaneous/email-automation",
        element: (
          <RoleGuard allowedRoles={["Admin", "HR"]}>
            <ModuleGuard module="email_automation">
              <EmailAutomation />
            </ModuleGuard>
          </RoleGuard>
        ),
      },
      {
        path: "miscellaneous/asset-categories",
        element: (
          <RoleGuard allowedRoles={["Admin", "HR"]}>
            <ModuleGuard module="assets">
              <AssetCategories />
            </ModuleGuard>
          </RoleGuard>
        ),
      },
      {
        path: "assets",
        element: (
          <RoleGuard allowedRoles={["Admin", "HR"]}>
            <ModuleGuard module="assets">
              <AssetDashboard />
            </ModuleGuard>
          </RoleGuard>
        ),
      },
      {
        path: "assets/inventory",
        element: (
          <RoleGuard allowedRoles={["Admin", "HR"]}>
            <ModuleGuard module="assets">
              <AssetInventory />
            </ModuleGuard>
          </RoleGuard>
        ),
      },
      {
        path: "my-assets",
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
            <ModuleGuard module="assets">
              <MyAssets />
            </ModuleGuard>
          </RoleGuard>
        ),
      },
      {
        path: "help",
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
            <Help />
          </RoleGuard>
        ),
      },
    ],
  },
]);
