import React, { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Search,
  Book,
  // MessageCircle,
  Mail,
  FileText,
  Users,
  Briefcase,
  Layers,
  CreditCard,
  Settings,
  Clock,
  Calendar,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

interface FAQCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  items: FAQItem[];
}

const FAQAccordion = ({ item }: { item: FAQItem }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`border border-border rounded-xl bg-white dark:bg-bg-card overflow-hidden transition-all duration-300 ${
        isOpen
          ? "shadow-md ring-1 ring-brand-primary/20"
          : "hover:border-brand-primary/30"
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left transition-colors"
      >
        <span
          className={`font-medium text-lg ${
            isOpen ? "text-brand-primary" : "text-text-primary"
          }`}
        >
          {item.question}
        </span>
        <div
          className={`p-2 rounded-full transition-colors ${
            isOpen
              ? "bg-brand-primary/10 text-brand-primary"
              : "bg-bg-secondary text-text-secondary"
          }`}
        >
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pt-0">
          <div className="pt-4 border-t border-border/50 text-text-secondary leading-relaxed space-y-2">
            {item.answer}
          </div>
        </div>
      )}
    </div>
  );
};

const Help = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const getFAQsForRole = (role: string): FAQCategory[] => {
    // --- Data Definitions ---

    const attendanceFAQs: FAQCategory = {
      id: "attendance",
      title: "Attendance & Time",
      icon: Clock,
      description: "Clock-ins, timesheets, and corrections",
      items: [
        {
          question: "How do I clock in/out?",
          answer: (
            <>
              <p>
                Go to the <strong>Attendance</strong> page.
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>
                  Ensure you are on the <strong>Clock In/Out</strong> tab.
                </li>
                <li>Click the large circular button to punch your time.</li>
                <li>The system captures your location if required.</li>
              </ul>
            </>
          ),
        },
        {
          question: "How do I fix a missed punch?",
          answer:
            "Navigate to 'Attendance' &gt; 'Corrections'. Click 'Request Correction', enter the correct time and reason, and submit it for your manager's approval.",
        },
        {
          question: "Where is my attendance history?",
          answer:
            "Switch to the 'History' tab in the Attendance module to see a calendar view of your daily logs and working hours.",
        },
      ],
    };

    const leaveFAQs: FAQCategory = {
      id: "leave",
      title: "Leave Management",
      icon: Calendar,
      description: "Applications, balances, and holidays",
      items: [
        {
          question: "How do I apply for leave?",
          answer:
            "Go to 'Leave Management', click the 'Apply for Leave' button (top right), select the leave type and dates, and submit.",
        },
        {
          question: "How do I check my leave balance?",
          answer:
            "Your available balances for Casual, Sick, and Earned leave are displayed in the summary cards at the top of the 'Leave Management' dashboard.",
        },
      ],
    };

    const projectFAQs: FAQCategory = {
      id: "projects",
      title: "Projects & Tasks",
      icon: Briefcase,
      description: "Project tracking and task management",
      items: [
        {
          question: "How do I view my projects?",
          answer:
            "Go to 'Projects'. You will see a grid of project cards you are assigned to. Click on any card to view detailed tasks and team members.",
        },
        {
          question: "How can I edit a project?",
          answer:
            "If you are a Manager or Admin, hover over the project card in the dashboard. An 'Edit' (pencil) icon will appear in the top-right corner of the card.",
        },
      ],
    };

    const payrollFAQs: FAQCategory = {
      id: "payroll",
      title: "Payroll & Finance",
      icon: CreditCard,
      description: "Payslips, tax, and salary processing",
      items: [
        {
          question: "Where can I download my payslip?",
          answer:
            "Navigate to 'Payroll & Finance' &gt; 'My Payslips'. You will see a list of generated payslips available for PDF download.",
        },
        {
          question: "How are taxes handled?",
          answer:
            "Tax deductions are automated based on the configured regulatory brackets. Check the 'Deductions' section of your payslip for details.",
        },
      ],
    };

    const hierarchyFAQs: FAQCategory = {
      id: "hierarchy",
      title: "Organization",
      icon: Layers,
      description: "Reporting lines and team structure",
      items: [
        {
          question: "How do I view the organizational chart?",
          answer:
            "Go to the 'Hierarchy' module. This interactive chart shows the reporting structure from the CEO down to individual contributors.",
        },
      ],
    };

    const managerFAQs: FAQCategory = {
      id: "manager",
      title: "Manager Actions",
      icon: Users,
      description: "Approvals and team oversight",
      items: [
        {
          question: "How do I approve leave requests?",
          answer:
            "In 'Leave Management', switch to the 'Approvals' tab. You can Approve or Reject pending requests from your team members here.",
        },
        {
          question: "How do I approve attendance corrections?",
          answer:
            "Go to 'Attendance' &gt; 'Pending Approvals'. Review the requested time changes and approve them to update the employee's log.",
        },
      ],
    };

    const hrFAQs: FAQCategory = {
      id: "hr",
      title: "HR Administration",
      icon: FileText,
      description: "Onboarding and policies",
      items: [
        {
          question: "How do I add a new employee?",
          answer: (
            <>
              <p>
                Go to <strong>Employee Management</strong> and click the{" "}
                <strong>Add Employee</strong> button.
              </p>
              <p className="mt-2">
                Complete the tabs for Basic Info, Work Info, and Personal
                Details. This automatically creates their user account and sends
                a welcome email.
              </p>
            </>
          ),
        },
        {
          question: "How do I change an employee's status?",
          answer:
            "In 'Employee Management', find the user in the list. Click the 'Status Toggle' icon (User with check/x) in the Actions column to activate or deactivate them.",
        },
      ],
    };

    const adminFAQs: FAQCategory = {
      id: "admin",
      title: "System Admin",
      icon: Settings,
      description: "Configuration, roles, and logs",
      items: [
        {
          question: "How do I create custom roles?",
          answer:
            "Go to 'Role Management' &gt; 'Add Role'. Define the role name and select precise permissions for each module before saving.",
        },
        {
          question: "How do I assign shifts?",
          answer: (
            <>
              <p>
                <strong>Step 1:</strong> Ensure the shift exists in 'Shift
                Management'.
              </p>
              <p>
                <strong>Step 2:</strong> Go to 'Employee Management', click the{" "}
                <strong>Edit (pencil)</strong> icon for the employee.
              </p>
              <p>
                <strong>Step 3:</strong> In the 'Work Info' tab, select the
                correct Shift from the dropdown.
              </p>
            </>
          ),
        },
        {
          question: "How do I process payroll?",
          answer: (
            <div className="space-y-2">
              <p>Go to 'Payroll & Finance' &gt; 'Payroll Processing'.</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Select the Month/Year.</li>
                <li>
                  Click <strong>Calculate</strong> for an employee (or bulk
                  calculate).
                </li>
                <li>
                  Review the draft, then click <strong>Approve</strong>.
                </li>
                <li>
                  Finally, click <strong>Mark as Paid</strong> to release the
                  payslip.
                </li>
              </ol>
            </div>
          ),
        },
        {
          question: "How do I moderate the Social Wall?",
          answer:
            "Admins can delete inappropriate content. Hover over any post on the Social Wall, click the 'More Options' (three dots) menu that appears, and select 'Delete'.",
        },
        {
          question: "Where is the Audit Trail?",
          answer:
            "Go to 'System Administration' &gt; 'Audit Trail'. This logs all critical system actions for security and compliance.",
        },
      ],
    };

    // --- Role Logic ---
    let categories = [
      attendanceFAQs,
      leaveFAQs,
      projectFAQs,
      payrollFAQs,
      hierarchyFAQs,
    ];

    if (role === "Project Manager") categories.push(managerFAQs);
    if (role === "HR") {
      categories.push(managerFAQs);
      categories.push(hrFAQs);
    }
    if (role === "Admin" || role === "Super Admin") {
      categories.push(managerFAQs);
      categories.push(hrFAQs);
      categories.push(adminFAQs);
    }

    return categories;
  };

  const role = user?.role || "Employee";
  const allCategories = getFAQsForRole(role);

  // Filter Categories
  const filteredCategories = useMemo(() => {
    let cats = allCategories;

    if (activeCategory !== "all") {
      cats = cats.filter((c) => c.id === activeCategory);
    }

    if (searchQuery) {
      cats = cats
        .map((cat) => ({
          ...cat,
          items: cat.items.filter(
            (item) =>
              item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (typeof item.answer === "string" &&
                item.answer.toLowerCase().includes(searchQuery.toLowerCase()))
          ),
        }))
        .filter((cat) => cat.items.length > 0);
    }
    return cats;
  }, [allCategories, searchQuery, activeCategory]);

  return (
    <div
      className="min-h-screen pb-12 bg-bg-main animate-in fade-in duration-500"
      style={{ marginTop: -32, marginLeft: -32, marginRight: -32 }}
    >
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary/90 to-brand-secondary/90 text-white pb-24 pt-16">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 bg-black/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-full mb-6 ring-1 ring-white/20 shadow-lg">
            <HelpCircle className="text-white" size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            How can we help you, {user?.name?.split(" ")[0]}?
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-medium">
            Find answers, manage your work, and get the most out of HRMS.
          </p>
        </div>
      </div>

      {/* Floating Search Bar */}
      <div className="max-w-3xl mx-auto px-6 -mt-8 relative z-10">
        <div className="relative group">
          <div className="absolute inset-0 bg-brand-primary/20 blur-xl rounded-2xl group-hover:bg-brand-primary/30 transition-colors"></div>
          <div className="relative bg-white dark:bg-bg-card rounded-2xl shadow-xl flex items-center p-2 ring-1 ring-border">
            <Search className="ml-4 text-text-muted" size={24} />
            <input
              type="text"
              placeholder="Search for answers (e.g., 'apply leave', 'payslip', 'shift')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-transparent border-none focus:ring-0 text-text-primary placeholder:text-text-muted/70 text-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mr-2 p-2 hover:bg-bg-hover rounded-full text-text-muted transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Category Filters */}
        {!searchQuery && (
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === "all"
                  ? "bg-brand-primary text-white shadow-md shadow-brand-primary/25"
                  : "bg-white dark:bg-bg-card border border-border text-text-secondary hover:bg-bg-hover"
              }`}
            >
              All Topics
            </button>
            {allCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? "bg-brand-primary text-white shadow-md shadow-brand-primary/25"
                    : "bg-white dark:bg-bg-card border border-border text-text-secondary hover:bg-bg-hover"
                }`}
              >
                <cat.icon size={16} />
                {cat.title}
              </button>
            ))}
          </div>
        )}

        {/* FAQ Content */}
        <div className="space-y-12">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <div
                key={category.id}
                className="animate-in slide-in-from-bottom-4 duration-500"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-brand-primary/10 rounded-xl text-brand-primary">
                    <category.icon size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-text-primary tracking-tight">
                      {category.title}
                    </h2>
                    <p className="text-text-secondary text-sm">
                      {category.description}
                    </p>
                  </div>
                </div>
                <div className="grid gap-4">
                  {category.items.map((item, idx) => (
                    <FAQAccordion key={idx} item={item} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20">
              <div className="bg-bg-secondary/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Book size={40} className="text-text-muted" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                No matching results
              </h3>
              <p className="text-text-secondary max-w-sm mx-auto">
                We couldn't find any FAQs matching "{searchQuery}". Try a
                different specific keyword.
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-6 text-brand-primary font-medium hover:underline"
              >
                View all topics
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contact Support Footer */}
      <div className="max-w-5xl mx-auto px-6 mt-12">
        <div className="bg-brand-secondary/5 dark:bg-brand-secondary/10 border border-brand-primary/10 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none"></div>

          <h2 className="text-2xl font-bold text-text-primary mb-4 relative z-10">
            Still need help?
          </h2>
          <p className="text-text-secondary max-w-lg mx-auto mb-8 relative z-10">
            Our support team is just a click away. Reach out to us for detailed
            assistance with your account.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-bg-card border border-border hover:border-brand-primary/50 text-text-primary rounded-xl font-medium transition-all shadow-sm hover:shadow-md group">
              <Mail
                size={18}
                className="text-brand-primary group-hover:scale-110 transition-transform"
              />
              Email Support
            </button>
            {/* <button className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl font-medium shadow-lg shadow-brand-primary/25 hover:shadow-xl hover:shadow-brand-primary/30 hover:-translate-y-0.5 transition-all">
              <MessageCircle size={18} />
              Start Live Chat
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
