import { useAuth } from "../../context/AuthContext";
import EmployeeDashboard from "./components/EmployeeDashboard";
import PMDashboard from "./components/PMDashboard";
import HRDashboard from "./components/HRDashboard";
import AccountantDashboard from "./components/AccountantDashboard";
import ContractorDashboard from "./components/ContractorDashboard";
import InternDashboard from "./components/InternDashboard";
import AdminDashboard from "./components/AdminDashboard";
import { CEODashboard } from "./components/CEODashboard";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  // Render dashboard based on role

  switch (user.role) {
    case "Admin":
      return <AdminDashboard />;
    case "HR":
      return <HRDashboard />;
    case "Project Manager":
      return <PMDashboard />;
    case "Accountant":
      return <AccountantDashboard />;
    case "Consultant":
      return <ContractorDashboard />;
    case "Intern":
      return <InternDashboard />;
    case "CEO":
      return <CEODashboard />;
    case "Employee":
    default:
      return <EmployeeDashboard />;
  }
}
