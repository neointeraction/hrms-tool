export default function EmployeeDirectory() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text-primary">
          Employee Directory
        </h1>
        <button className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-secondary transition-colors">
          Add Employee
        </button>
      </div>
      <div className="bg-bg-card rounded-lg shadow-sm border border-border p-6">
        <p className="text-text-secondary">
          Employee list will be displayed here.
        </p>
      </div>
    </div>
  );
}
