import { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { cn } from "../utils/cn";
import { useAuth } from "../context/AuthContext";
import { getAccessibleMenuItems } from "../utils/navigation";
import NotificationDropdown from "../components/layout/NotificationDropdown";
import ChatWidget from "../features/chat/ChatWidget";
import { Tooltip } from "../components/common/Tooltip";
import { Avatar } from "../components/common/Avatar";
import { useNotification } from "../context/NotificationContext";
import { useOnClickOutside } from "../hooks/useOnClickOutside";

export default function MainLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
  ];

  const sidebarStructure =
    user?.role === "CEO"
      ? [
          {
            title: "Overview",
            items: ["/"],
          },
        ]
      : [
          {
            title: "Overview",
            items: ["/"],
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
            items: ["/organization"],
          },
          {
            title: "System",
            items: ["/settings", "/miscellaneous"],
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

  // Get accessible menu items from navigation utility and merge with icons
  const accessibleRoutes = user ? getAccessibleMenuItems(user.role) : [];

  // Filter routes based on tenant feature toggles
  const tenantLimits =
    user?.tenantId &&
    typeof user.tenantId === "object" &&
    "limits" in user.tenantId
      ? user.tenantId.limits
      : null;

  const enabledModules = tenantLimits?.enabledModules;

  // Map routes to module names (key must match module names in backend/EditTenantModal)
  const routeModuleMap: Record<string, string> = {
    "/attendance": "attendance",
    "/leave": "leave",
    "/payroll": "payroll",
    "/projects": "projects",
    "/clients": "projects", // Group with projects module for access control
    "/social": "social",
    "/assets": "assets",
    "/my-assets": "assets",
    "/employees": "employees",
    "/employee-management": "employees",
    "/roles": "roles",
    "/designations": "employees",
    "/settings/documents": "documents",
    "/audit": "audit",
    "/organization": "organization",
    "/miscellaneous/feedback": "feedback",
    "/miscellaneous/appreciation": "appreciation",
    "/miscellaneous/email-automation": "email_automation",
    "/tasks": "tasks",
    "/ai-configuration": "ai_chatbot",
    "/shifts": "shifts",
    "/resignation/manage": "employees", // Group with employee module or create new module
    "/resignation/submit": "employees", // Everyone should have access if they have employee module access? Or base access.
  };

  const filteredRoutes = accessibleRoutes.filter((route) => {
    // If user is Super Admin, show everything (or handled by RoleGuard/getAccessibleMenuItems already)
    if (user?.role === "Super Admin") return true;

    // If no limits defined for tenant (e.g. legacy), default to show (or hide? safe default is show for backward compat)
    if (!enabledModules) return true;

    // specific check for social wall if it's the route
    if (route.to === "/social" && !enabledModules.includes("social"))
      return false;

    const module = routeModuleMap[route.to];
    if (module && !enabledModules.includes(module)) {
      return false;
    }
    // Check for Role-based module access
    // If not Super Admin, and user has accessibleModules defined, we enforce it.
    if ((user?.role as string) !== "Super Admin" && user?.accessibleModules) {
      // Social wall check
      if (route.to === "/social" && !user.accessibleModules.includes("social"))
        return false;

      const module = routeModuleMap[route.to];

      // Exemption: "Admin" role or "Company Admin" should ALWAYS have access to Role Management and Employee Management
      // to prevent lockouts and allow bootstrapping permissions.
      if (
        (user.role === "Admin" || user.isCompanyAdmin) &&
        (module === "roles" || module === "employees")
      ) {
        return true;
      }

      // Exemption: Project Manager should have access to Resignation Management
      if (
        user.role === "Project Manager" &&
        route.to === "/resignation/manage"
      ) {
        return true;
      }

      if (module && !user.accessibleModules.includes(module)) {
        // console.log("Hiding route:", route.to, "Module:", module);
        return false;
      }
    }

    return true;
  });

  const getBreadcrumbs = () => {
    const path = location.pathname;

    // Route-specific breadcrumb mappings
    const breadcrumbMap: Record<string, string[]> = {
      "/": ["Dashboard"],
      "/miscellaneous": ["Miscellaneous"],
      "/miscellaneous/feedback": ["Miscellaneous", "Feedback"],
      "/miscellaneous/appreciation": ["Miscellaneous", "Appreciation"],
      "/miscellaneous/email-automation": ["Miscellaneous", "Email Automation"],
      "/miscellaneous/asset-categories": ["Miscellaneous", "Asset Categories"],
      "/assets": ["Asset Management", "Dashboard"],
      "/assets/inventory": ["Asset Management", "Inventory"],
      "/my-assets": ["My Assets"],
      "/social": ["Social Wall"],
      "/shifts": ["Shift Management"],
      "/ai-configuration": ["AI Chatbot Configuration"],
    };

    // Check if we have a specific mapping
    if (breadcrumbMap[path]) {
      return breadcrumbMap[path];
    }

    // Dynamic Routes
    if (path.startsWith("/projects/") && path.split("/").length === 3) {
      return ["Project Management", "Project Details"];
    }

    // Fallback: try to find in allNavItems
    const item = allNavItems.find((item) => item.to === path);
    return item ? [item.label] : ["Page"];
  };

  // Mobile Profile State
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
  const mobileProfileRef = useRef<HTMLDivElement>(null!);
  useOnClickOutside(mobileProfileRef, () => setIsMobileProfileOpen(false));

  return (
    <div className="min-h-screen bg-bg-main flex flex-col md:flex-row transition-colors duration-200">
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
                {user?.role !== "Super Admin" && (
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
                <span
                  className={
                    index === getBreadcrumbs().length - 1
                      ? "font-medium text-text-primary"
                      : "text-text-muted"
                  }
                >
                  {crumb}
                </span>
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
                    {user?.role !== "Super Admin" && (
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
      {/* Chat Widget - Only show for employees (not admins) */}
      {user?.role !== "Super Admin" && user?.role !== "Admin" && <ChatWidget />}
    </div>
  );
}
