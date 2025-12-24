import { useEffect, useState } from "react";
import { apiService, ASSET_BASE_URL } from "../../../services/api.service";
import {
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  Network,
  Search,
  Mail,
  Phone,
  Smartphone,
} from "lucide-react";
import { Avatar } from "../../../components/common/Avatar";
import { Skeleton } from "../../../components/common/Skeleton";
import { Tooltip } from "../../../components/common/Tooltip";
import { Input } from "../../../components/common/Input";
import { useNotification } from "../../../context/NotificationContext";

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  designation: string;
  department?: string;
  email?: string;
  phoneNumber?: string;
  workPhone?: string;
  personalMobile?: string;
  profilePicture?: string;
  isOnline?: boolean;
  reportingManager?: {
    _id: string;
    firstName: string;
    lastName: string;
  } | null;
  children?: Employee[];
}

const TreeNode = ({ node }: { node: Employee }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      <div
        className={`
          flex flex-col items-center p-3 rounded-lg border border-border bg-bg-card shadow-sm hover:shadow-md transition-all
          ${hasChildren ? "cursor-pointer" : ""}
          w-48 relative z-10
        `}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full overflow-hidden mb-2 border-2 border-brand-primary/20">
          <Avatar
            src={
              node.profilePicture
                ? node.profilePicture.startsWith("http")
                  ? node.profilePicture
                  : `${ASSET_BASE_URL}${node.profilePicture}`.replace(
                      "//uploads",
                      "/uploads"
                    )
                : undefined
            }
            name={`${node.firstName} ${node.lastName}`}
            alt={node.firstName}
            className="w-full h-full"
            size="md"
          />
        </div>

        {/* Info */}
        <div className="text-center">
          <h3 className="font-semibold text-text-primary text-sm truncate w-full">
            {node.firstName} {node.lastName}
          </h3>
          <p className="text-xs text-text-secondary truncate w-full">
            {node.designation || "N/A"}
          </p>
        </div>

        {/* Expand/Collapse Indicator */}
        {hasChildren && (
          <div className="absolute -bottom-3 bg-bg-card rounded-full p-0.5 border border-border">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="flex flex-col items-center mt-4 relative">
          {/* Vertical line from parent */}
          <div className="w-px h-4 bg-border absolute -top-4"></div>

          <div className="flex gap-4 pt-4 relative">
            {/* Horizontal line connecting children */}
            {node.children!.length > 1 && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-border w-[calc(100%-12rem)]" />
            )}

            {node.children!.map((child) => (
              <div
                key={child._id}
                className="flex flex-col items-center relative"
              >
                {/* Vertical line to child */}
                <div className="w-px h-4 bg-border absolute -top-4"></div>
                <TreeNode node={child} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function TeamHierarchy() {
  const { showToast } = useNotification();
  const [view, setView] = useState<"hierarchy" | "directory">("hierarchy");
  const [tree, setTree] = useState<Employee[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch both for seamless switching, or fetch on demand.
      // Fetching both is safer for consistent data.
      const [hierarchyData, employeesData] = await Promise.all([
        apiService.getHierarchy(),
        // Use directory endpoint for safe access for all employees
        apiService.getDirectory(),
      ]);

      const builtTree = buildTree(hierarchyData);
      setTree(builtTree);
      setEmployees(employeesData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const buildTree = (employees: Employee[]) => {
    const employeeMap = new Map<string, Employee>();
    const roots: Employee[] = [];

    // Initialize map
    employees.forEach((emp) => {
      employeeMap.set(emp._id, { ...emp, children: [] });
    });

    // Build connections
    employees.forEach((emp) => {
      const node = employeeMap.get(emp._id)!;
      if (
        emp.reportingManager &&
        typeof emp.reportingManager === "object" &&
        "_id" in emp.reportingManager &&
        employeeMap.has((emp.reportingManager as any)._id)
      ) {
        const parentId = (emp.reportingManager as any)._id;
        const parent = employeeMap.get(parentId)!;
        parent.children!.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const filteredEmployees = employees.filter((emp) => {
    const term = searchTerm.toLowerCase();
    return (
      emp.firstName.toLowerCase().includes(term) ||
      emp.lastName.toLowerCase().includes(term) ||
      emp.designation.toLowerCase().includes(term) ||
      (emp.department && emp.department.toLowerCase().includes(term))
    );
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-bg-card rounded-lg border border-border p-8">
        {/* Root Node Skeleton */}
        <div className="flex flex-col items-center mb-8 relative">
          <div className="flex flex-col items-center p-3 rounded-lg border border-border bg-bg-main w-48 shadow-sm">
            <Skeleton className="w-12 h-12 rounded-full mb-2" />
            <Skeleton className="w-32 h-4 mb-2" />
            <Skeleton className="w-24 h-3" />
          </div>
          {/* Vertical Line */}
          <div className="w-px h-8 bg-border absolute -bottom-8"></div>
        </div>

        {/* Children Level */}
        <div className="flex gap-8 relative">
          {/* Connecting Line */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-[calc(100%-12rem)] h-px bg-border"></div>

          {[1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center relative">
              <div className="w-px h-4 bg-border absolute -top-4"></div>
              <div className="flex flex-col items-center p-3 rounded-lg border border-border bg-bg-main w-48 shadow-sm">
                <Skeleton className="w-12 h-12 rounded-full mb-2" />
                <Skeleton className="w-32 h-4 mb-2" />
                <Skeleton className="w-24 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-8 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Hierarchy Container */}
      <div className="bg-bg-card rounded-lg shadow-sm border border-border flex flex-col h-full min-h-[600px] overflow-hidden">
        {/* Tabs Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setView("hierarchy")}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                view === "hierarchy"
                  ? "border-brand-primary text-brand-primary bg-brand-primary/5"
                  : "border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-hover"
              }`}
            >
              <Network size={16} />
              Org Chart
            </button>
            <button
              onClick={() => setView("directory")}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                view === "directory"
                  ? "border-brand-primary text-brand-primary bg-brand-primary/5"
                  : "border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-hover"
              }`}
            >
              <LayoutGrid size={16} />
              Directory
            </button>
          </div>

          {/* Search (only for directory) */}
          {view === "directory" && (
            <div className="pr-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="text-text-muted" size={16} />}
                  className="bg-bg-secondary w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 relative">
          {view === "hierarchy" ? (
            <div className="absolute inset-0 overflow-auto p-8 flex justify-center bg-bg-secondary/20">
              <div className="min-w-max flex justify-center gap-12">
                {tree.length > 0 ? (
                  tree.map((root) => <TreeNode key={root._id} node={root} />)
                ) : (
                  <div className="text-center text-text-secondary mt-12">
                    No hierarchy data available.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 overflow-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredEmployees.map((emp) => (
                  <div
                    key={emp._id}
                    className="group relative bg-bg-card border border-border rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col items-center text-center p-4"
                  >
                    {/* Top Accent Bar */}

                    <div className="mt-2 mb-3 relative">
                      <div className="w-16 h-16 rounded-full border-2 border-white dark:border-bg-card shadow-md ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
                        <Avatar
                          src={
                            emp.profilePicture
                              ? emp.profilePicture.startsWith("http")
                                ? emp.profilePicture
                                : `${ASSET_BASE_URL}${emp.profilePicture}`.replace(
                                    "//uploads",
                                    "/uploads"
                                  )
                              : undefined
                          }
                          name={`${emp.firstName} ${emp.lastName}`}
                          alt={emp.firstName}
                          className="w-full h-full"
                          size="md"
                        />
                      </div>
                      {/* Online Status */}
                      <div className="absolute bottom-0 right-0 p-0.5 bg-bg-card rounded-full">
                        <div
                          className={`w-3 h-3 rounded-full border-2 border-bg-card ${
                            emp.isOnline ? "bg-status-success" : "bg-gray-300"
                          }`}
                          title={emp.isOnline ? "Online" : "Offline"}
                        />
                      </div>
                    </div>

                    <div className="w-full mb-3">
                      <h3 className="font-bold text-text-primary text-sm truncate px-1">
                        {emp.firstName} {emp.lastName}
                      </h3>
                      <p className="text-brand-primary text-xs font-medium truncate px-1 mb-1">
                        {emp.designation}
                      </p>
                      <span className="inline-block px-2 py-0.5 bg-bg-secondary text-text-secondary text-xs rounded-full truncate max-w-full">
                        {emp.department || "General"}
                      </span>
                    </div>

                    {/* Contact Actions - Horizontal Row */}
                    <div className="w-full flex items-center justify-center gap-2 mt-auto pt-3 border-t border-border">
                      {emp.workPhone && (
                        <Tooltip
                          content={`Work: ${emp.workPhone} (Click to copy)`}
                        >
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(emp.workPhone!);
                              showToast(
                                "Work phone copied to clipboard",
                                "success"
                              );
                            }}
                            className="p-2 rounded-full bg-bg-hover text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10 transition-colors"
                          >
                            <Phone size={14} />
                          </button>
                        </Tooltip>
                      )}

                      {emp.personalMobile && (
                        <Tooltip
                          content={`Mobile: ${emp.personalMobile} (Click to copy)`}
                        >
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                emp.personalMobile!
                              );
                              showToast(
                                "Mobile number copied to clipboard",
                                "success"
                              );
                            }}
                            className="p-2 rounded-full bg-bg-hover text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10 transition-colors"
                          >
                            <Smartphone size={14} />
                          </button>
                        </Tooltip>
                      )}

                      <Tooltip content={`Email: ${emp.email} (Click to copy)`}>
                        <button
                          onClick={() => {
                            if (emp.email) {
                              navigator.clipboard.writeText(emp.email);
                              showToast("Email copied to clipboard", "success");
                            }
                          }}
                          className="p-2 rounded-full bg-bg-hover text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10 transition-colors"
                        >
                          <Mail size={14} />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                ))}
                {filteredEmployees.length === 0 && (
                  <div className="col-span-full text-center py-12 text-text-secondary">
                    No employees found matching your search.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
