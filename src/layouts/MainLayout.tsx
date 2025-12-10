import { useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Users,
  User,
  UserCircle2,
  Menu,
  X,
  Moon,
  Sun,
  ChevronRight,
  LogOut,
  LayoutDashboard,
  Clock,
  ClipboardList,
  CalendarDays,
  Banknote,
  Briefcase,
  Network,
} from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { cn } from "../utils/cn";
import { useAuth } from "../context/AuthContext";
import { getAccessibleMenuItems } from "../utils/navigation";
import NotificationDropdown from "../components/layout/NotificationDropdown";
import ChatWidget from "../features/chat/ChatWidget";

export default function MainLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const allNavItems = [
    {
      to: "/",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      to: "/employee-management",
      icon: Users,
      label: "Employee Management",
    },
    {
      to: "/attendance",
      icon: Clock,
      label: "Attendance & Time Tracking",
    },
    {
      to: "/audit",
      icon: ClipboardList,
      label: "Audit Trail",
    },
    {
      to: "/leave",
      icon: CalendarDays,
      label: "Leave Management",
    },
    {
      to: "/payroll",
      icon: Banknote,
      label: "Payroll & Finance",
    },
    {
      to: "/projects",
      icon: Briefcase,
      label: "Project Management",
    },
    {
      to: "/organization",
      icon: Network,
      label: "Hierarchy",
    },
  ];

  // Get accessible menu items from navigation utility and merge with icons
  const accessibleRoutes = user ? getAccessibleMenuItems(user.role) : [];
  const navItems = accessibleRoutes.map((route) => {
    const navItem = allNavItems.find((item) => item.to === route.to);
    return {
      ...route,
      icon: navItem?.icon || User,
    };
  });

  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === "/") return "Dashboard";
    const item = navItems.find((item) => item.to === path);
    return item ? item.label : "Page";
  };

  return (
    <div className="min-h-screen bg-bg-main flex flex-col md:flex-row transition-colors duration-200">
      {/* Mobile Header */}
      <header className="md:hidden bg-bg-sidebar border-b border-border p-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <button onClick={toggleSidebar} className="text-text-primary p-1">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <span className="font-bold text-xl text-brand-primary">HRMS</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationDropdown />
          <div className="w-8 h-8 rounded-full bg-brand-secondary flex items-center justify-center text-white font-bold text-sm overflow-hidden">
            {user?.avatar?.length === 2 ? (
              user.avatar
            ) : (
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-10 w-[280px] bg-bg-sidebar border-r border-border transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen flex flex-col",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 hidden md:flex items-center justify-between border-b border-border h-16">
          <span className="font-bold text-2xl text-brand-primary">HRMS</span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-primary/10 text-brand-primary"
                    : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                )
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-4">
          <div className="space-y-2">{/* Dev Role Switcher Removed */}</div>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm w-full px-4 py-2 rounded-lg hover:bg-bg-hover transition-colors"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-0 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-[calc(100vh-64px)] md:h-screen overflow-hidden">
        {/* Desktop Header */}
        <header className="hidden md:flex bg-bg-sidebar border-b border-border h-16 px-8 items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <span className="text-text-muted">Home</span>
            <ChevronRight size={16} />
            <span className="font-medium text-text-primary">
              {getBreadcrumbs()}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <NotificationDropdown />
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 pl-4 border-l border-border hover:opacity-80 transition-opacity"
              >
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-text-primary">
                    {user?.name}
                  </p>
                  <p className="text-xs text-text-muted">{user?.designation}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-brand-secondary flex items-center justify-center text-white font-bold overflow-hidden">
                  {user?.avatar?.length === 2 ? (
                    user.avatar
                  ) : (
                    <img
                      src={user?.avatar}
                      alt={user?.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </button>

              {isProfileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsProfileOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-bg-card rounded-lg shadow-lg border border-border py-1 z-20">
                    <div className="px-4 py-2 border-b border-border md:hidden">
                      <p className="text-sm font-medium text-text-primary">
                        {user?.name}
                      </p>
                      <p className="text-xs text-text-muted">
                        {user?.designation}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate("/profile");
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-bg-hover flex items-center gap-2"
                    >
                      <UserCircle2 size={16} />
                      My Profile
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileOpen(false);
                        navigate("/login", { replace: true });
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-status-error hover:bg-bg-hover flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-8xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}
