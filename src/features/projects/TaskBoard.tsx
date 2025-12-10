import { useState, useEffect } from "react";
import { apiService } from "../../services/api.service";
import { Loader } from "../../components/common/Loader";

interface TaskBoardProps {
  projectId: string;
}

export default function TaskBoard({ projectId }: TaskBoardProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) loadTasks();
  }, [projectId]);

  const loadTasks = async () => {
    try {
      const data = await apiService.getTasks({ projectId });
      setTasks(data.tasks || []);
    } catch (err) {
      console.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (taskId: string, newStatus: string) => {
    try {
      // Optimistic update
      const updatedTasks = tasks.map((t) =>
        t._id === taskId ? { ...t, status: newStatus } : t
      );
      setTasks(updatedTasks);

      await apiService.updateTask(taskId, { status: newStatus });
    } catch (err) {
      console.error("Failed to update status");
      loadTasks(); // Revert
    }
  };

  const columns = ["To Do", "In Progress", "Review", "Done"];

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader size={32} />
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full overflow-x-auto">
      {columns.map((status) => (
        <div key={status} className="bg-bg-main rounded-lg p-4 min-w-[250px]">
          <h3 className="font-semibold text-text-secondary text-sm mb-3 flex justify-between">
            {status}
            <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
              {tasks.filter((t) => t.status === status).length}
            </span>
          </h3>
          <div className="space-y-3">
            {tasks
              .filter((task) => task.status === status)
              .map((task) => (
                <div
                  key={task._id}
                  className="bg-white border border-border rounded p-3 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-sm text-text-primary mb-1">
                      {task.title}
                    </h4>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        task.priority === "High"
                          ? "bg-status-error"
                          : task.priority === "Urgent"
                          ? "bg-status-error"
                          : task.priority === "Low"
                          ? "bg-status-success"
                          : "bg-status-warning"
                      }`}
                      title={task.priority}
                    ></div>
                  </div>

                  {task.assignee && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-5 h-5 rounded-full bg-brand-primary/10 flex items-center justify-center text-[10px] text-brand-primary font-bold">
                        {task.assignee.name?.charAt(0) || "U"}
                      </div>
                      <span className="text-xs text-text-secondary truncate">
                        {task.assignee.name}
                      </span>
                    </div>
                  )}

                  {/* Move actions (Simplified without drag/drop) */}
                  <div className="flex justify-end gap-1 mt-3 pt-2 border-t border-gray-100">
                    {status !== "To Do" && (
                      <button
                        onClick={() =>
                          updateStatus(
                            task._id,
                            columns[columns.indexOf(status) - 1]
                          )
                        }
                        className="text-[10px] px-1 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        &lt; Back
                      </button>
                    )}
                    {status !== "Done" && (
                      <button
                        onClick={() =>
                          updateStatus(
                            task._id,
                            columns[columns.indexOf(status) + 1]
                          )
                        }
                        className="text-[10px] px-1 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        Next &gt;
                      </button>
                    )}
                  </div>
                </div>
              ))}
            {tasks.filter((t) => t.status === status).length === 0 && (
              <div className="text-center py-4 text-xs text-gray-400 border border-dashed border-gray-200 rounded">
                No tasks
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
