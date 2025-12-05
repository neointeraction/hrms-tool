import { Monitor, Smartphone, Plus, RefreshCw } from "lucide-react";

export default function AssetManagement() {
  // Mock data
  const assets = [
    {
      id: 1,
      type: "Laptop",
      name: "MacBook Pro 16",
      serial: "FVFD234KJL",
      assignedTo: "John Doe",
      assignedDate: "2024-01-15",
      returnDate: "2025-01-15",
      status: "Assigned",
    },
    {
      id: 2,
      type: "Phone",
      name: "iPhone 15",
      serial: "DX342KJL23",
      assignedTo: "Jane Smith",
      assignedDate: "2023-11-01",
      returnDate: "2024-11-01",
      status: "Assigned",
    },
    {
      id: 3,
      type: "Laptop",
      name: "Dell XPS 15",
      serial: "DL34234234",
      assignedTo: null,
      assignedDate: null,
      returnDate: null,
      status: "Available",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-text-primary">
          Asset Management
        </h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors">
          <Plus size={18} />
          Add Asset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-bg-main p-4 rounded-lg border border-border flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Monitor size={24} />
          </div>
          <div>
            <p className="text-text-secondary text-sm">Total Laptops</p>
            <p className="text-2xl font-bold text-text-primary">12</p>
          </div>
        </div>
        <div className="bg-bg-main p-4 rounded-lg border border-border flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <Smartphone size={24} />
          </div>
          <div>
            <p className="text-text-secondary text-sm">Total Phones</p>
            <p className="text-2xl font-bold text-text-primary">8</p>
          </div>
        </div>
        <div className="bg-bg-main p-4 rounded-lg border border-border flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
            <RefreshCw size={24} />
          </div>
          <div>
            <p className="text-text-secondary text-sm">Maintenance</p>
            <p className="text-2xl font-bold text-text-primary">2</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border text-text-secondary text-sm">
              <th className="py-3 px-4 font-medium">Asset</th>
              <th className="py-3 px-4 font-medium">Serial Number</th>
              <th className="py-3 px-4 font-medium">Assigned To</th>
              <th className="py-3 px-4 font-medium">Assigned Date</th>
              <th className="py-3 px-4 font-medium">Return Date</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr
                key={asset.id}
                className="border-b border-border hover:bg-bg-hover/50 transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {asset.type === "Laptop" ? (
                      <Monitor size={16} className="text-text-muted" />
                    ) : (
                      <Smartphone size={16} className="text-text-muted" />
                    )}
                    <span className="text-text-primary font-medium">
                      {asset.name}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-text-secondary font-mono text-xs">
                  {asset.serial}
                </td>
                <td className="py-3 px-4 text-text-secondary">
                  {asset.assignedTo || "-"}
                </td>
                <td className="py-3 px-4 text-text-secondary">
                  {asset.assignedDate || "-"}
                </td>
                <td className="py-3 px-4 text-text-secondary">
                  {asset.returnDate || "-"}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      asset.status === "Assigned"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {asset.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button className="text-brand-primary hover:text-brand-secondary text-sm font-medium">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
