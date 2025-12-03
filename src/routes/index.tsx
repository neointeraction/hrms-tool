import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "../features/dashboard/Dashboard";
import Timesheet from "../features/timesheets/Timesheet";
import LeaveManagement from "../features/leaves/LeaveManagement";
import CareerGrowth from "../features/growth/CareerGrowth";
import Payroll from "../features/payroll/Payroll";
import Profile from "../features/profile/Profile";
import RoleGuard from "../components/auth/RoleGuard";

import Login from "../pages/Login";
import Unauthorized from "../pages/Unauthorized";

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
        path: "work",
        element: (
          <RoleGuard
            allowedRoles={["admin", "pm", "employee", "intern", "contractor"]}
          >
            <Timesheet />
          </RoleGuard>
        ),
      },
      {
        path: "leaves",
        element: (
          <RoleGuard allowedRoles={["admin", "hr", "pm", "employee", "intern"]}>
            <LeaveManagement />
          </RoleGuard>
        ),
      },
      {
        path: "growth",
        element: (
          <RoleGuard allowedRoles={["admin", "hr", "pm", "employee"]}>
            <CareerGrowth />
          </RoleGuard>
        ),
      },
      {
        path: "payroll",
        element: (
          <RoleGuard allowedRoles={["admin", "hr", "accountant"]}>
            <Payroll />
          </RoleGuard>
        ),
      },
      {
        path: "profile",
        element: (
          <RoleGuard
            allowedRoles={[
              "admin",
              "hr",
              "accountant",
              "pm",
              "employee",
              "intern",
              "contractor",
            ]}
          >
            <Profile />
          </RoleGuard>
        ),
      },
    ],
  },
]);
