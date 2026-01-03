import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService, ASSET_BASE_URL } from "../../services/api.service";
import { Avatar } from "../../components/common/Avatar";
import { JourneyTimeline } from "./components/JourneyTimeline";
import {
  Mail,
  Phone,
  Award,
  User,
  ArrowLeft,
  Shield,
  LayoutGrid,
} from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "../../components/common/Skeleton";

interface Employee {
  id: string;
  name: string;
  email: string;
  designation: string;
  department: string;
  profilePicture?: string;
  isOnline?: boolean;
  employeeId: string;
  doj: string;
  workPhone?: string;
  personalMobile?: string;
  reportingManager?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

interface Appreciation {
  _id: string;
  awardType: string;
  message: string;
  date: string;
  giver: {
    name: string;
    avatar?: string;
  };
}

const PublicProfileSkeleton = () => (
  <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-pulse">
    {/* Back Navigation Skeleton */}
    <Skeleton className="h-6 w-20" />

    {/* Header Card Skeleton */}
    <div className="bg-bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="h-32 bg-gray-200 dark:bg-gray-800"></div>
      <div className="px-8 pb-8">
        <div className="relative flex justify-between items-end -mt-12 mb-6">
          <div className="flex items-end gap-6">
            <div className="w-32 h-32 rounded-full border-4 border-bg-card bg-gray-300 dark:bg-gray-700 p-1 shadow-md" />
            <div className="pb-2 mb-1 space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-64" />
            </div>
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="flex gap-4 pt-4 border-t border-border">
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>
    </div>

    {/* Navigation Tabs Skeleton */}
    <div className="flex border-b border-border gap-6">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-10 w-40" />
    </div>

    {/* Content Area Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
        <Skeleton className="h-6 w-40 mb-2" />
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex justify-between border-b border-border pb-3"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>

      <div className="bg-bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
        <Skeleton className="h-6 w-48 mb-2" />
        <div className="flex items-center gap-4 p-4 bg-bg-main rounded-lg border border-border">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function EmployeePublicProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [appreciations, setAppreciations] = useState<Appreciation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "journey" | "badges">(
    "overview"
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [empData, badgesData] = await Promise.all([
          apiService.getEmployeePublicProfile(id),
          apiService.getAppreciations({ recipientId: id }),
        ]);

        // Transform API response to match interface if needed
        // Assuming getEmployeeById returns raw backend object, we might need mapping
        // But getEmployeeById in api.service.ts returns response.json().
        // Based on getMe, it might structure it differently.
        // Let's assume standard employee object structure or similar to getDirectory.

        // Actually getEmployeeById usually returns { ...employeeFields, user: { ... } } or flattened.
        // Let's inspect the data during dev or safe mapping.
        // Standardizing on what getDirectory returns:
        // firstName, lastName, designation, department, etc.

        const formatName = (first: string, last: string) => `${first} ${last}`;

        setEmployee({
          id: empData._id,
          name: formatName(empData.firstName, empData.lastName),
          email: empData.email,
          designation: empData.designation,
          department: empData.department,
          profilePicture: empData.profilePicture,
          employeeId: empData.employeeId,
          doj: empData.dateOfJoining,
          workPhone: empData.workPhone,
          personalMobile: empData.personalMobile,
          reportingManager: empData.reportingManager,
          isOnline: empData.isOnline, // if available
        });

        setAppreciations(badgesData);
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <PublicProfileSkeleton />;
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-text-secondary">
        <User size={48} className="mb-4 opacity-50" />
        <p>Employee not found</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-brand-primary hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  const getBadgeIcon = (type: string) => {
    // Mapping for badge types
    switch (type?.toLowerCase()) {
      case "star_performer":
        return <Award className="text-yellow-500" />;
      case "team_player":
        return <User className="text-blue-500" />;
      case "innovator":
        return <LayoutGrid className="text-purple-500" />; // Placeholder
      default:
        return <Award className="text-brand-primary" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-500">
      {/* Back Navigation */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      {/* Header Card */}
      <div className="bg-bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-brand-primary/10 to-brand-primary/5"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="flex items-end gap-6">
              <div className="w-32 h-32 rounded-full border-4 border-bg-card bg-bg-card p-1 shadow-md">
                <Avatar
                  src={
                    employee.profilePicture
                      ? employee.profilePicture.startsWith("http")
                        ? employee.profilePicture
                        : `${ASSET_BASE_URL}${employee.profilePicture}`.replace(
                            "//uploads",
                            "/uploads"
                          )
                      : undefined
                  }
                  name={employee.name}
                  className="w-full h-full rounded-full"
                  size="lg" // Assuming 'lg' maps to large size or we enforce generic class
                />
              </div>
              <div className="pb-2 mb-1">
                <h1 className="text-3xl font-bold text-text-primary">
                  {employee.name}
                </h1>
                <p className="text-text-secondary text-lg flex items-center gap-2">
                  {employee.designation}
                  <span className="w-1.5 h-1.5 rounded-full bg-text-muted"></span>
                  {employee.department}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions / Contact */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
            {employee.email && (
              <a
                href={`mailto:${employee.email}`}
                className="flex items-center gap-2 text-sm text-text-secondary hover:text-brand-primary transition-colors px-3 py-2 rounded-lg hover:bg-bg-hover"
              >
                <Mail size={16} />
                {employee.email}
              </a>
            )}
            {employee.workPhone && (
              <a
                href={`tel:${employee.workPhone}`}
                className="flex items-center gap-2 text-sm text-text-secondary hover:text-brand-primary transition-colors px-3 py-2 rounded-lg hover:bg-bg-hover"
              >
                <Phone size={16} />
                {employee.workPhone}
              </a>
            )}
            {/* Add more if needed */}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "overview"
              ? "border-brand-primary text-brand-primary"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("journey")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "journey"
              ? "border-brand-primary text-brand-primary"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          Journey Timeline
        </button>
        <button
          onClick={() => setActiveTab("badges")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "badges"
              ? "border-brand-primary text-brand-primary"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          Badges & Recognition
        </button>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-bg-card p-6 rounded-xl border border-border shadow-sm">
              <h3 className="flex items-center gap-2 font-semibold text-text-primary mb-6">
                <User size={18} /> Basic Information
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-border pb-3">
                  <span className="text-text-secondary text-sm">
                    Employee ID
                  </span>
                  <span className="text-text-primary font-medium text-sm">
                    {employee.employeeId}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border pb-3">
                  <span className="text-text-secondary text-sm">
                    Date of Joining
                  </span>
                  <span className="text-text-primary font-medium text-sm">
                    {employee.doj
                      ? format(new Date(employee.doj), "dd/MM/yyyy")
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border pb-3">
                  <span className="text-text-secondary text-sm">
                    Department
                  </span>
                  <span className="text-text-primary font-medium text-sm">
                    {employee.department}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border pb-3">
                  <span className="text-text-secondary text-sm">
                    Designation
                  </span>
                  <span className="text-text-primary font-medium text-sm">
                    {employee.designation}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-bg-card p-6 rounded-xl border border-border shadow-sm">
              <h3 className="flex items-center gap-2 font-semibold text-text-primary mb-6">
                <Shield size={18} /> Reporting Manager
              </h3>
              {employee.reportingManager ? (
                <div className="flex items-center gap-4 p-4 bg-bg-main rounded-lg border border-border">
                  <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
                    {employee.reportingManager.firstName[0]}
                    {employee.reportingManager.lastName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      {employee.reportingManager.firstName}{" "}
                      {employee.reportingManager.lastName}
                    </p>
                    <p className="text-xs text-text-secondary">Manager</p>
                  </div>
                </div>
              ) : (
                <div className="text-text-secondary italic">
                  No reporting manager assigned
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "journey" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <JourneyTimeline employeeId={employee.id} />
          </div>
        )}

        {activeTab === "badges" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {appreciations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {appreciations.map((badge) => (
                  <div
                    key={badge._id}
                    className="bg-bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col items-center text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-brand-primary/5 flex items-center justify-center mb-4">
                      {getBadgeIcon(badge.awardType)}
                    </div>
                    <h3 className="font-bold text-text-primary mb-1 capitalize">
                      {badge.awardType.replace(/_/g, " ")}
                    </h3>
                    <p className="text-xs text-text-secondary mb-4">
                      {format(new Date(badge.date), "MMM dd, yyyy")}
                    </p>
                    <p className="text-sm text-text-secondary italic mb-4">
                      "{badge.message}"
                    </p>
                    <div className="mt-auto flex items-center gap-2 text-xs text-text-muted">
                      <span>Given by</span>
                      <span className="font-medium text-text-primary">
                        {badge.giver.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
                <Award size={48} className="mb-4 opacity-20" />
                <p>No badges received yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
