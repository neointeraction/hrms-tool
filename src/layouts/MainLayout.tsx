import { useState, useEffect, useRef } from "react";

import {
  Outlet,
  NavLink,
  useLocation,
  useNavigate,
  Link,
} from "react-router-dom";
import {
  Users,
  UserCircle2,
  Shield,
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
  Building2,
  BarChart3,
  Settings,
  Package,
  Grid,
  Hash,
  FileText,
  Badge,
  Sparkles,
  CalendarClock,
  Rocket,
  HelpCircle,
  MapPin,
} from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { cn } from "../utils/cn";
import { useAuth } from "../context/AuthContext";
import { getAccessibleMenuItems } from "../utils/navigation";
import NotificationDropdown from "../components/layout/NotificationDropdown";
import ChatWidget from "../features/chat/ChatWidget";
import { AgentChat } from "../components/AgentChat";
import { Tooltip } from "../components/common/Tooltip";
import { Avatar } from "../components/common/Avatar";
import { useNotification } from "../context/NotificationContext";
import { useOnClickOutside } from "../hooks/useOnClickOutside";

import { WelcomeModal } from "../components/common/WelcomeModal";

export default function MainLayout() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme(user, isAuthenticated);
  const { unreadSocialCount, clearSocialNotifications } = useNotification();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Desktop Profile State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef<HTMLDivElement>(null!);
  useOnClickOutside(profileRef, () => setIsProfileOpen(false));
  // Update Favicon
  useEffect(() => {
    if (user?.tenantId && typeof user.tenantId === "object") {
      const settings = (user.tenantId as any).settings;
      if (settings?.favicon) {
        const link: HTMLLinkElement | null =
          document.querySelector("link[rel~='icon']");
        if (link) {
          link.href = settings.favicon;
        } else {
          const newLink = document.createElement("link");
          newLink.rel = "icon";
          newLink.href = settings.favicon;
          document.head.appendChild(newLink);
        }
      }
    }
  }, [user]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const allNavItems = [
    {
      to: "/",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      to: "/my-journey",
      icon: Rocket,
      label: "My Journey",
    },
    {
      to: "/employee-management",
      icon: Users,
      label: "Employee Management",
    },
    {
      to: "/roles",
      icon: Shield,
      label: "Role Management",
    },
    {
      to: "/settings/documents",
      icon: FileText,
      label: "Document Management",
    },
    {
      to: "/attendance",
      icon: Clock,
      label: "Attendance & Time Tracking",
    },
    {
      to: "/shifts",
      icon: CalendarClock,
      label: "Shift Management",
    },
    {
      to: "/designations",
      icon: Badge,
      label: "Designation Management",
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
      to: "/clients",
      icon: Users, // Or another icon like Building2
      label: "Client Management",
    },
    {
      to: "/organization",
      icon: Network,
      label: "Hierarchy",
    },
    {
      to: "/locations",
      icon: MapPin, // Use MapPin for locations
      label: "Location Management",
    },
    {
      to: "/social",
      icon: Hash,
      label: "Social Wall",
    },
    {
      to: "/ai-configuration",
      icon: Sparkles,
      label: "AI Chatbot Configuration",
    },
    {
      to: "/superadmin/tenants",
      icon: Building2,
      label: "Tenant Management",
    },
    {
      to: "/superadmin/analytics",
      icon: BarChart3,
      label: "Platform Analytics",
    },
    {
      to: "/superadmin/users",
      icon: Users,
      label: "User Management",
    },
    {
      to: "/superadmin/settings",
      icon: Settings,
      label: "Platform Settings",
    },
    {
      to: "/miscellaneous",
      icon: Grid,
      label: "Miscellaneous",
    },
    {
      to: "/assets",
      icon: Package,
      label: "Asset Management",
    },
    {
      to: "/my-assets",
      icon: Package,
      label: "My Assets",
    },
    {
      to: "/settings",
      icon: Settings,
      label: "System Settings",
    },
    {
      to: "/resignation/submit",
      icon: LogOut,
      label: "My Resignation",
    },
    {
      to: "/resignation/manage",
      icon: LogOut,
      label: "Exit Management",
    },
    {
      to: "/help",
      icon: HelpCircle,
      label: "Help",
    },
  ];

  const fullSidebarStructure = [
    {
      title: "Overview",
      items: ["/", "/my-journey"],
    },
    {
      title: "People Management",
      items: [
        "/employee-management",
        "/roles",
        "/designations",
        "/resignation/manage",
      ],
    },
    {
      title: "Time & Attendance",
      items: ["/attendance", "/shifts", "/leave"],
    },
    {
      title: "Work & Payroll",
      items: ["/projects", "/clients", "/payroll"],
    },
    {
      title: "Resources",
      items: ["/settings/documents", "/assets"],
    },
    {
      title: "Intelligence & Monitoring",
      items: ["/ai-configuration", "/audit"],
    },
    {
      title: "Organization Structure",
      items: ["/organization", "/locations"],
    },
    {
      title: "System",
      items: ["/settings", "/miscellaneous", "/help"],
    },
    {
      title: "Platform Administration",
      items: [
        "/superadmin/analytics",
        "/superadmin/tenants",
        "/superadmin/users",
        "/superadmin/settings",
      ],
    },
  ];

  // Restrict Super Admin to only Platform Administration
  const sidebarStructure = user?.isSuperAdmin
    ? [
        {
          title: "Platform Administration",
          items: [
            "/superadmin/analytics",
            "/superadmin/tenants",
            "/superadmin/users",
            "/superadmin/settings",
          ],
        },
      ]
    : fullSidebarStructure;

  // Get accessible menu items from navigation utility
  const accessibleRoutes = user ? getAccessibleMenuItems(user) : [];

  // Simplification: tenantLimits and enabledModules were only used for the now-removed filteredRoutes logic
  // or are accessed directly from user object elsewhere.

  // Simplified: accessibleRoutes already contains the filtered list
  const filteredRoutes = accessibleRoutes;

  const getBreadcrumbs = () => {
    const path = location.pathname;

    type BreadcrumbItem = {
      label: string;
      to?: string;
    };

    // Route-specific breadcrumb mappings
    const breadcrumbMap: Record<string, BreadcrumbItem[]> = {
      "/": [{ label: "Dashboard", to: "/" }],
      "/miscellaneous": [{ label: "Miscellaneous", to: "/miscellaneous" }],
      "/miscellaneous/feedback": [
        { label: "Miscellaneous", to: "/miscellaneous" },
        { label: "Feedback" },
      ],
      "/miscellaneous/appreciation": [
        { label: "Miscellaneous", to: "/miscellaneous" },
        { label: "Appreciation" },
      ],
      "/miscellaneous/email-automation": [
        { label: "Miscellaneous", to: "/miscellaneous" },
        { label: "Email Automation" },
      ],
      "/miscellaneous/asset-categories": [
        { label: "Miscellaneous", to: "/miscellaneous" },
        { label: "Asset Categories" },
      ],
      "/assets": [
        { label: "Asset Management", to: "/assets" },
        { label: "Dashboard" },
      ],
      "/assets/inventory": [
        { label: "Asset Management", to: "/assets" },
        { label: "Inventory" },
      ],
      "/my-assets": [{ label: "My Assets" }],
      "/my-journey": [{ label: "My Journey" }],
      "/social": [{ label: "Social Wall" }],
      "/shifts": [{ label: "Shift Management" }],
      "/ai-configuration": [{ label: "AI Chatbot Configuration" }],
    };

    // Check if we have a specific mapping
    if (breadcrumbMap[path]) {
      return breadcrumbMap[path];
    }

    // Dynamic Routes
    if (path.startsWith("/projects/") && path.split("/").length === 3) {
      return [
        { label: "Project Management", to: "/projects" },
        { label: "Project Details" },
      ];
    }

    if (path.startsWith("/organization/employee/")) {
      return [
        { label: "Organization", to: "/organization?tab=directory" },
        { label: "Employee Profile" },
      ];
    }

    // Fallback: try to find in allNavItems
    const item = allNavItems.find((item) => item.to === path);
    return item ? [{ label: item.label }] : [{ label: "Page" }];
  };

  // Mobile Profile State
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
  const mobileProfileRef = useRef<HTMLDivElement>(null!);
  useOnClickOutside(mobileProfileRef, () => setIsMobileProfileOpen(false));

  return (
    <div className="min-h-screen bg-bg-main flex flex-col md:flex-row transition-colors duration-200">
      <WelcomeModal />
      {/* Mobile Header */}
      <header className="md:hidden bg-bg-sidebar border-b border-border p-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <button onClick={toggleSidebar} className="text-text-primary p-1">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          {(user?.tenantId as any)?.settings?.logo ? (
            <img
              src={(user?.tenantId as any).settings.logo}
              alt="Company Logo"
              className="h-8 w-auto object-contain"
            />
          ) : (
            <span className="font-bold text-xl text-brand-primary">
              NeointeractionHR
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {accessibleRoutes.some((r) => r.to === "/social") &&
            (!user?.tenantId ||
              typeof user.tenantId === "string" ||
              !user.tenantId.limits ||
              user.tenantId.limits?.enabledModules?.includes("social")) && (
              <button
                onClick={() => {
                  clearSocialNotifications();
                  navigate("/social");
                }}
                className="p-1 text-text-secondary relative"
              >
                <Hash size={20} />
                {unreadSocialCount > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white" />
                )}
              </button>
            )}
          <NotificationDropdown />

          {/* Mobile Profile Dropdown */}
          <div className="relative" ref={mobileProfileRef}>
            <button
              onClick={() => setIsMobileProfileOpen(!isMobileProfileOpen)}
              className="focus:outline-none"
            >
              <Avatar
                src={user?.avatar}
                name={user?.name}
                alt={user?.name}
                size="sm"
              />
            </button>

            {isMobileProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-bg-card rounded-lg shadow-lg border border-border py-1 z-50">
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-text-muted truncate">
                    {user?.designation}
                  </p>
                </div>
                {user?.role !== "Super Admin" && user?.role !== "CEO" && (
                  <button
                    onClick={() => {
                      setIsMobileProfileOpen(false);
                      navigate("/profile");
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-bg-hover flex items-center gap-2"
                  >
                    <UserCircle2 size={16} />
                    My Profile
                  </button>
                )}

                <button
                  onClick={() => {
                    logout();
                    setIsMobileProfileOpen(false);
                    navigate("/login", { replace: true });
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-status-error hover:bg-bg-hover flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] bg-bg-sidebar border-r border-border transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen flex flex-col",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 flex items-center justify-between border-b border-border h-16">
          {(user?.tenantId as any)?.settings?.logo ? (
            <img
              src={(user?.tenantId as any).settings.logo}
              alt="Company Logo"
              className="h-10 w-auto object-contain"
            />
          ) : (
            <span className="font-bold text-2xl text-brand-primary">
              NeointeractionHR
            </span>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {sidebarStructure.map((section) => {
            // Find accessible items for this section
            const sectionItems = section.items
              .map((path) => {
                // Check if route is accessible (filteredRoutes contains accessible routes objects)
                const isAccessible = filteredRoutes.some((r) => r.to === path);
                if (!isAccessible) return null;

                // Find full item details
                return allNavItems.find((item) => item.to === path);
              })
              .filter(Boolean) as typeof allNavItems;

            if (sectionItems.length === 0) return null;

            return (
              <div key={section.title}>
                <h3 className="px-4 text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2 mt-2">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {sectionItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsSidebarOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group",
                          isActive
                            ? "bg-brand-primary/10 text-brand-primary"
                            : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                        )
                      }
                    >
                      <item.icon
                        size={18}
                        className={cn(
                          "transition-colors",
                          "group-hover:text-current"
                        )}
                      />
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
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
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-[calc(100vh-64px)] md:h-screen overflow-hidden">
        {/* Desktop Header */}
        <header
          className="hidden md:flex bg-bg-sidebar border-b border-border h-16 px-8 items-center justify-between sticky top-0 z-10"
          style={{ zIndex: 999 }}
        >
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <span className="text-text-muted">Home</span>
            {getBreadcrumbs().map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                <ChevronRight size={16} />
                {crumb.to && index !== getBreadcrumbs().length - 1 ? (
                  <Link
                    to={crumb.to}
                    className="text-text-muted hover:text-text-primary transition-colors cursor-pointer hover:underline"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className={
                      index === getBreadcrumbs().length - 1
                        ? "font-medium text-text-primary"
                        : "text-text-muted"
                    }
                  >
                    {crumb.label}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {/* Social Wall Link - Only if accessible and enabled */}
            {accessibleRoutes.some((r) => r.to === "/social") &&
              (!user?.tenantId ||
                typeof user.tenantId === "string" ||
                !user.tenantId.limits ||
                user.tenantId.limits?.enabledModules?.includes("social")) && (
                <Tooltip content="Social Wall">
                  <button
                    onClick={() => {
                      clearSocialNotifications();
                      navigate("/social");
                    }}
                    className="relative p-2 text-text-secondary hover:text-brand-primary hover:bg-bg-hover rounded-full transition-colors"
                  >
                    <Hash size={20} />
                    {unreadSocialCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                    )}
                  </button>
                </Tooltip>
              )}
            <NotificationDropdown />
            <div className="relative" ref={profileRef}>
              <Tooltip content="User Profile">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 pl-4 border-l border-border hover:opacity-80 transition-opacity"
                >
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-medium text-text-primary">
                      {user?.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {user?.designation}
                    </p>
                  </div>
                  <Avatar
                    src={user?.avatar}
                    name={user?.name}
                    alt={user?.name}
                    size="md"
                  />
                </button>
              </Tooltip>

              {isProfileOpen && (
                <>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-bg-card rounded-lg shadow-lg border border-border py-1 z-20">
                    <div className="px-4 py-2 border-b border-border md:hidden">
                      <p className="text-sm font-medium text-text-primary">
                        {user?.name}
                      </p>
                      <p className="text-xs text-text-muted">
                        {user?.designation}
                      </p>
                    </div>
                    {user?.role !== "Super Admin" && user?.role !== "CEO" && (
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
                    )}

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
      {/* Chat Widget - Show if AI Chatbot module is enabled for the tenant */}
      {((user?.tenantId as any)?.limits?.enabledModules?.includes(
        "ai_chatbot"
      ) ||
        user?.accessibleModules?.includes("ai_chatbot")) && <ChatWidget />}

      {/* HR Agent - Only for Admin/HR */}
      {(user?.role === "Admin" || user?.role === "HR") && <AgentChat />}
    </div>
  );
}
