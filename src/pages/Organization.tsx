import TeamHierarchy from "../features/team/components/TeamHierarchy";

export default function Organization() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-text-primary">
          Organization Structure
        </h1>
        <p className="text-text-secondary">
          View the reporting hierarchy of the organization.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border p-6 min-h-[600px]">
        <TeamHierarchy />
      </div>
    </div>
  );
}
