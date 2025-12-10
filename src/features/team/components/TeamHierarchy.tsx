import { useEffect, useState } from "react";
import { apiService, ASSET_BASE_URL } from "../../../services/api.service";
import { Loader2, ChevronRight, ChevronDown } from "lucide-react";
import Avatar from "../../../components/ui/Avatar";

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  designation: string;
  profilePicture?: string;
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
          flex flex-col items-center p-3 rounded-lg border bg-white shadow-sm hover:shadow-md transition-all
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
                ? `${ASSET_BASE_URL}${node.profilePicture}`.replace(
                    "//uploads",
                    "/uploads"
                  ) // Ensure no double slashes if ASSET_BASE_URL has trailing slash
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
          <div className="absolute -bottom-3 bg-white rounded-full p-0.5 border border-border">
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
  const [tree, setTree] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHierarchy();
  }, []);

  const fetchHierarchy = async () => {
    try {
      const data = await apiService.getHierarchy();
      const builtTree = buildTree(data);
      setTree(builtTree);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load hierarchy");
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
      // Check if employee has a reporting manager AND that manager exists in our dataset
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-brand-primary" size={32} />
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

  if (tree.length === 0) {
    return (
      <div className="text-center text-text-secondary p-8">
        No hierarchy data available.
      </div>
    );
  }

  return (
    <div className="overflow-auto p-8 border border-border rounded-xl bg-gray-50 min-h-[500px]">
      <div className="min-w-max flex justify-center gap-12">
        {tree.map((root) => (
          <TreeNode key={root._id} node={root} />
        ))}
      </div>
    </div>
  );
}
