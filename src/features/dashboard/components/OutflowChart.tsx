import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface OutflowChartProps {
  data: Array<{ name: string; amount: number }>;
}

export const OutflowChart = ({ data }: OutflowChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-text-muted text-sm">
        No payment data available for this month
      </div>
    );
  }

  return (
    <div className="h-full w-full p-2">
      <h3 className="text-sm font-medium text-text-secondary mb-4">
        Payment Distribution (This Month)
      </h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 20,
              left: 0,
              bottom: 20, // Increased bottom margin for labels
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E5E7EB"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 10 }} // Smaller font for axis
              dy={10}
              interval={0} // Show all labels
              stroke="#E5E7EB"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 10 }}
              tickFormatter={(value) => `₹${value / 1000}k`}
              dx={-10}
              stroke="#E5E7EB"
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                backgroundColor: "#FFFFFF",
                borderColor: "#E5E7EB",
                borderRadius: "8px",
                fontSize: "12px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value: any) => [
                Number(value || 0).toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                }),
                "Net Salary",
              ]}
              labelStyle={{
                color: "#374151",
                fontWeight: "bold",
                marginBottom: "4px",
              }}
            />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]} barSize={40}>
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index % 2 === 0 ? "#4F46E5" : "#6366F1"}
                /> // Alternating branded colors
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
