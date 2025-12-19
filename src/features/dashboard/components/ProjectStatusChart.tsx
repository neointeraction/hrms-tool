import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ProjectStatusChartProps {
  data: Array<{ name: string; value: number }>;
}

const COLORS = {
  Active: "#10B981", // Emerald 500
  Completed: "#3B82F6", // Blue 500
  "On Hold": "#F59E0B", // Amber 500
  Cancelled: "#EF4444", // Red 500
  Default: "#6B7280", // Gray 500
};

export const ProjectStatusChart = ({ data }: ProjectStatusChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-text-muted text-sm">
        No project data available
      </div>
    );
  }

  return (
    <div className="h-full w-full p-2">
      <h3 className="text-sm font-medium text-text-secondary mb-4">
        Project Status Overview
      </h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    COLORS[entry.name as keyof typeof COLORS] || COLORS.Default
                  }
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFFFF",
                borderColor: "#E5E7EB",
                borderRadius: "8px",
                fontSize: "12px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value: any) => [value, "Projects"]}
              itemStyle={{ color: "#374151", fontWeight: "bold" }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "12px", color: "#6B7280" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
