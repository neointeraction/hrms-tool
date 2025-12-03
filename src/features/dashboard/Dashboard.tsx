import { useAuth } from "../../context/AuthContext";
import EmployeeDashboard from "./components/EmployeeDashboard";
import PMDashboard from "./components/PMDashboard";
import HRDashboard from "./components/HRDashboard";
import AccountantDashboard from "./components/AccountantDashboard";
import ContractorDashboard from "./components/ContractorDashboard";
import InternDashboard from "./components/InternDashboard";
import AdminDashboard from "./components/AdminDashboard";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case "admin":
      return <AdminDashboard />;
    case "hr":
      return <HRDashboard />;
    case "pm":
      return <PMDashboard />;
    case "accountant":
      return <AccountantDashboard />;
    case "contractor":
      return <ContractorDashboard />;
    case "intern":
      return <InternDashboard />;
    case "employee":
    default:
      return <EmployeeDashboard />;
  }
}
