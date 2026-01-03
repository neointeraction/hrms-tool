import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Send,
  MessageSquarePlus,
  MessageSquareQuote,
  Plus,
  ClipboardList,
  Trash2,
  Pencil,
} from "lucide-react";
// ... (rest of imports)

const DEFAULT_QUESTIONS = [
  "Behaves in a manner consistent with the company's mission, vision and values",
  "Is viewed as a person of integrity by co-workers",
  "Has an attitude of helpfulness toward co-workers",
  "Complies with company policies and procedures",
  "Is professional and courteous when communicating with coworkers",
  "Represents the company in a positive manner when interacting with customers",
  "Is interested in continuing to develop new skills and to grow as a professional",
  "Follows through with tasks and responsibilities in an appropriate and timely manner",
  "Demonstrates respect for the work and ideas of others",
  "Is considerate of the needs of others",
  "Is willing to accept responsibility for his or her own actions",
  "Is someone that you feel would make an effective supervisor",
  "Is someone you feel comfortable approaching to ask for assistance or advice",
  "Stays focused on helping internal and external customers",
  "Demonstrates a willingness to listen to what others have to say",
];

// ... inside component

import { apiService } from "../services/api.service";
import { ConfirmationModal } from "../components/common/ConfirmationModal";
import { Modal } from "../components/common/Modal";
import { Button } from "../components/common/Button";
import { Table } from "../components/common/Table";
import { Badge } from "../components/common/Badge";
import { Select } from "../components/common/Select";
import { useAuth } from "../context/AuthContext";
import { Tooltip } from "../components/common/Tooltip";

interface EmployeeOption {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  firstName: string;
  lastName: string;
}

interface FeedbackItem {
  _id: string;
  sender: {
    _id: string;
    name: string;
  };
  message: string;
  createdAt: string;
}

interface Question {
  text: string;
  type: "rating" | "text";
  order: number;
}

interface FeedbackForm {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
}

export default function Feedback() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  // Debug: Check role

  /* 
    Role Check Logic:
    - We check for standard capitalized roles "Admin" and "HR".
    - "Super Admin" should also have access.
    - We cast to string to avoid TypeScript union type mismatch/overlap errors if 'currentUser.role' is strictly typed 
      and we compare it against a string literal that isn't in that union (though "admin"/"hr" lowercase might be invalid, "Admin"/"HR" should be valid).
    - To be safe and permissive, we check variations.
  */
  const role = currentUser?.role as string;
  const isHRorAdmin =
    role === "Admin" ||
    role === "HR" ||
    role === "Super Admin" ||
    // Fallback for potential legacy/lowercase data
    role === "admin" ||
    role === "hr" ||
    currentUser?.isCompanyAdmin;

  // Tabs
  const [activeTab, setActiveTab] = useState<"peer" | "surveys">("surveys");

  // Common Data State
  const [loading, setLoading] = useState(true);

  // --- Peer Feedback State ---
  const [colleagues, setColleagues] = useState<EmployeeOption[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [message, setMessage] = useState("");
  const [sendingPeer, setSendingPeer] = useState(false);

  // --- Survey State ---
  const [forms, setForms] = useState<FeedbackForm[]>([]);
  const [viewMode, setViewMode] = useState<
    "list" | "create" | "respond" | "results"
  >("list");
  const [selectedForm, setSelectedForm] = useState<FeedbackForm | null>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<any>(null);

  // Create Form State
  const [newFormTitle, setNewFormTitle] = useState("");
  const [newFormDesc, setNewFormDesc] = useState("");
  const [newQuestions, setNewQuestions] = useState<Question[]>([]);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [creatingForm, setCreatingForm] = useState(false);
  const [editingForm, setEditingForm] = useState<FeedbackForm | null>(null);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<
    number | null
  >(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    show: boolean;
    formId: string;
    formTitle: string;
  }>({
    show: false,
    formId: "",
    formTitle: "",
  });

  // Respond State
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [comments, setComments] = useState("");
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [targetEmployeeId, setTargetEmployeeId] = useState("");

  // Modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const calculateScore = (answers: any) => {
    let total = 0;
    let count = 0;

    if (Array.isArray(answers)) {
      answers.forEach((ans: any) => {
        const val = ans.ratingValue; // Access property from object in array
        const num = val === "NE" ? NaN : parseInt(val, 10);
        if (!isNaN(num)) {
          total += num;
          count++;
        }
      });
    } else if (typeof answers === "object" && answers !== null) {
      // Fallback if somehow it's a map (for backward compat or optimistic updates)
      Object.values(answers).forEach((val: any) => {
        const num = parseInt(val, 10);
        if (!isNaN(num)) {
          total += num;
          count++;
        }
      });
    }

    return { total, count, average: count ? (total / count).toFixed(1) : "0" };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [employeesData, feedbacksData, formsData] = await Promise.all([
        apiService.getEmployees(),
        apiService.getMyFeedbacks(),
        apiService.getFeedbackForms(),
      ]);

      // Filter out self
      const validColleagues = employeesData.filter(
        (emp: any) => emp.user && emp.user._id !== currentUser?.id
      );
      setColleagues(validColleagues);
      setFeedbacks(feedbacksData);
      setForms(formsData);
    } catch (err) {
      console.error("Failed to fetch feedback data", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Peer Feedback Handlers ---
  const handlePeerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !message.trim()) return;

    setSendingPeer(true);
    setError("");

    try {
      await apiService.createFeedback({
        recipientId: selectedUser,
        message: message.trim(),
      });
      setSuccessMessage("Your feedback has been sent successfully!");
      setShowSuccessModal(true);
      setMessage("");
      setSelectedUser("");
    } catch (err: any) {
      setError(err.message || "Failed to send feedback");
    } finally {
      setSendingPeer(false);
    }
  };

  // --- Survey Handlers ---

  const handleCreateForm = async () => {
    if (!newFormTitle.trim() || newQuestions.length === 0) {
      setError("Please provide a title and at least one question.");
      return;
    }

    setCreatingForm(true);
    setError("");
    try {
      const payload = {
        title: newFormTitle,
        description: newFormDesc,
        questions: newQuestions,
        assignedTo: "all",
      };

      if (editingForm) {
        await apiService.updateFeedbackForm(editingForm._id, payload);
        setSuccessMessage("Survey updated successfully!");
      } else {
        await apiService.createFeedbackForm(payload);
        setSuccessMessage("Survey created successfully!");
      }

      setShowSuccessModal(true);
      setShowCreateModal(false);
      setEditingForm(null);
      setNewFormTitle("");
      setNewFormDesc("");
      setNewQuestions([]);
      setEditingQuestionIndex(null);
      setNewQuestionText("");
      // Refresh forms
      const updatedForms = await apiService.getFeedbackForms();
      setForms(updatedForms);
    } catch (err: any) {
      setError(err.message || "Failed to save survey");
    } finally {
      setCreatingForm(false);
    }
  };

  const handleDeleteForm = async () => {
    try {
      setLoading(true);
      await apiService.deleteFeedbackForm(showDeleteConfirm.formId);
      setSuccessMessage("Survey deleted successfully");
      setShowSuccessModal(true);
      setShowDeleteConfirm({ show: false, formId: "", formTitle: "" });
      const updatedForms = await apiService.getFeedbackForms();
      setForms(updatedForms);
    } catch (err: any) {
      setError(err.message || "Failed to delete survey");
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;

    if (editingQuestionIndex !== null) {
      // Update existing question
      const updated = [...newQuestions];
      updated[editingQuestionIndex] = {
        ...updated[editingQuestionIndex],
        text: newQuestionText,
      };
      setNewQuestions(updated);
      setEditingQuestionIndex(null);
    } else {
      // Add new question
      setNewQuestions([
        ...newQuestions,
        {
          text: newQuestionText,
          type: "rating",
          order: newQuestions.length + 1,
        },
      ]);
    }
    setNewQuestionText("");
  };

  const removeQuestion = (index: number) => {
    const updated = [...newQuestions];
    updated.splice(index, 1);
    setNewQuestions(updated);
    if (editingQuestionIndex === index) {
      setEditingQuestionIndex(null);
      setNewQuestionText("");
    }
  };

  const handleSurveySubmit = async () => {
    if (!selectedForm) return;

    if (!targetEmployeeId) {
      setError("Please select an employee to review.");
      return;
    }

    // Check if all questions answered?
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < selectedForm.questions.length) {
      setError("Please answer all questions.");
      return;
    }

    setSubmittingResponse(true);
    try {
      const payloadAnswers = selectedForm.questions.map((q: any) => ({
        questionId: q._id,
        ratingValue: answers[q._id],
        textValue: comments, // Include comments for all questions
      }));

      await apiService.submitFeedbackResponse({
        formId: selectedForm._id,
        targetUserId: targetEmployeeId, // Send selected employee ID
        answers: payloadAnswers,
      });

      setSuccessMessage("Response submitted successfully!");
      setShowSuccessModal(true);
      setViewMode("list");
      setSelectedForm(null);
      setAnswers({});
      setComments("");
      setTargetEmployeeId(""); // Reset selection
    } catch (err: any) {
      setError(err.message || "Failed to submit response");
    } finally {
      setSubmittingResponse(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-0">
          <Button
            variant="ghost"
            onClick={() => navigate("/miscellaneous")}
            leftIcon={<ChevronLeft size={20} />}
            style={{ paddingRight: "0", paddingLeft: "0" }}
          />
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Feedback & Surveys
            </h1>
            <p className="text-text-secondary">
              Share feedback and participate in surveys
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "surveys"
              ? "text-brand-primary border-b-2 border-brand-primary"
              : "text-text-secondary hover:text-text-primary"
          }`}
          onClick={() => {
            setActiveTab("surveys");
            setViewMode("list");
            setError("");
          }}
        >
          Surveys
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "peer"
              ? "text-brand-primary border-b-2 border-brand-primary"
              : "text-text-secondary hover:text-text-primary"
          }`}
          onClick={() => setActiveTab("peer")}
        >
          Peer Feedback
        </button>
      </div>

      {error && (
        <div className="bg-status-error/10 text-status-error p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* --- PEER FEEDBACK TAB --- */}
      {activeTab === "peer" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Send Feedback Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-bg-card border border-border rounded-xl p-6 shadow-sm sticky top-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <MessageSquarePlus className="text-brand-primary" size={20} />
                Send Feedback
              </h2>

              <form onSubmit={handlePeerSubmit} className="space-y-4">
                <div>
                  <Select
                    label="Recipient"
                    value={selectedUser}
                    onChange={(val) => setSelectedUser(val as string)}
                    options={colleagues.map((emp) => ({
                      value: emp.user._id,
                      label: `${emp.firstName} ${emp.lastName}`,
                    }))}
                    placeholder="Select a colleague..."
                    required={true}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your feedback here..."
                    className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 resize-none h-32"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={sendingPeer || !selectedUser || !message.trim()}
                  isLoading={sendingPeer}
                  leftIcon={<Send size={16} />}
                >
                  Send Feedback
                </Button>
              </form>
            </div>
          </div>

          {/* Recent Feedback Feed */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              My Feedback History
            </h2>

            <div className="space-y-4">
              {feedbacks.map((item) => (
                <div
                  key={item._id}
                  className="bg-bg-card border border-border rounded-xl p-4 shadow-sm flex items-start gap-3"
                >
                  <div className="flex-shrink-0 bg-brand-primary/5 rounded-full p-2 border border-brand-primary/10">
                    <div className="w-8 h-8 flex items-center justify-center">
                      <MessageSquareQuote className="w-5 h-5 text-brand-primary" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <p className="text-text-primary font-medium text-sm">
                          <span className="text-text-secondary">
                            Feedback from{" "}
                          </span>
                          <span className="font-bold text-brand-primary">
                            {item.sender.name}
                          </span>
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                          Received on{" "}
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 bg-bg-main p-3 rounded-lg text-sm text-text-secondary italic border border-border/50 break-words">
                      "{item.message}"
                    </div>
                  </div>
                </div>
              ))}

              {feedbacks.length === 0 && !loading && (
                <div className="text-center py-12 text-text-secondary bg-bg-main rounded-xl border border-border border-dashed">
                  <MessageSquareQuote
                    size={32}
                    className="mx-auto mb-2 opacity-50"
                  />
                  <p>No feedback received yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- SURVEYS TAB --- */}
      {activeTab === "surveys" && (
        <div>
          {/* List View */}
          {viewMode === "list" && (
            <div className="space-y-6">
              {isHRorAdmin && (
                <div className="flex justify-end gap-3">
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      try {
                        setLoading(true);
                        const payload = {
                          title: "Employee Review",
                          description:
                            "Standard performance review questionnaire.",
                          questions: DEFAULT_QUESTIONS.map((q, i) => ({
                            text: q,
                            type: "rating",
                            order: i + 1,
                          })),
                          assignedTo: "all",
                        };
                        await apiService.createFeedbackForm(payload);
                        setSuccessMessage(
                          "Default survey published successfully!"
                        );
                        setShowSuccessModal(true);
                        const updatedForms =
                          await apiService.getFeedbackForms();
                        setForms(updatedForms);
                      } catch (err: any) {
                        setError(err.message || "Failed to publish survey");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    leftIcon={<ClipboardList size={16} />}
                  >
                    Publish Default Survey
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingForm(null);
                      setNewQuestions([]);
                      setNewFormTitle("");
                      setNewFormDesc("");
                      setEditingQuestionIndex(null);
                      setNewQuestionText("");
                      setShowCreateModal(true);
                    }}
                    leftIcon={<Plus size={16} />}
                  >
                    Create New Survey
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {forms.map((form) => (
                  <div
                    key={form._id}
                    className="bg-bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => {
                      setSelectedForm(form);
                      setViewMode("respond");
                      setAnswers({});
                      setComments("");
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-lg">
                        <ClipboardList size={24} />
                      </div>
                      <span className="text-xs text-text-muted bg-bg-main px-2 py-1 rounded">
                        {new Date(form.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-brand-primary transition-colors">
                      {form.title}
                    </h3>
                    {form.description && (
                      <p className="text-sm text-text-secondary line-clamp-2 mb-4">
                        {form.description}
                      </p>
                    )}

                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-sm text-text-secondary">
                      <span>{form.questions.length} Questions</span>
                      <span className="text-brand-primary font-medium">
                        Start &rarr;
                      </span>
                    </div>

                    {isHRorAdmin && (
                      <div className="mt-4 pt-4 border-t border-border flex gap-2">
                        <Button
                          variant="secondary"
                          className="flex-1 text-xs h-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedForm(form);
                            setLoading(true);
                            apiService
                              .getFormResponses(form._id)
                              .then((res) => {
                                setResponses(res);
                                setViewMode("results");
                              })
                              .catch((err) =>
                                console.error("Failed to fetch responses", err)
                              )
                              .finally(() => setLoading(false));
                          }}
                        >
                          View Results
                        </Button>
                        <Tooltip content="Edit Survey">
                          <Button
                            variant="secondary"
                            className="h-8 w-8 !p-0 shrink-0 flex items-center justify-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingForm(form);
                              setNewFormTitle(form.title);
                              setNewFormDesc(form.description);
                              setNewQuestions(form.questions);
                              setEditingQuestionIndex(null);
                              setNewQuestionText("");
                              setShowCreateModal(true);
                            }}
                          >
                            <Pencil size={14} />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Delete Survey">
                          <Button
                            variant="danger"
                            className="h-8 w-8 !p-0 shrink-0 flex items-center justify-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteConfirm({
                                show: true,
                                formId: form._id,
                                formTitle: form.title,
                              });
                            }}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </Tooltip>
                      </div>
                    )}
                  </div>
                ))}

                {forms.length === 0 && !loading && (
                  <div className="col-span-full text-center py-12 bg-bg-main rounded-xl border border-dashed border-border text-text-secondary">
                    <ClipboardList
                      size={32}
                      className="mx-auto mb-2 opacity-50"
                    />
                    <p>No surveys available at the moment.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Create Modal (Admin) */}
          <Modal
            isOpen={showCreateModal}
            onClose={() => {
              setShowCreateModal(false);
              setEditingForm(null);
              setEditingQuestionIndex(null);
              setNewQuestionText("");
            }}
            title={editingForm ? "Edit Survey" : "Create New Survey"}
            maxWidth="max-w-3xl"
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Survey Title
                </label>
                <input
                  type="text"
                  value={newFormTitle}
                  onChange={(e) => setNewFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg"
                  placeholder="e.g., Q3 Peer Review"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={newFormDesc}
                  onChange={(e) => setNewFormDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg h-24 resize-none"
                  placeholder="Brief description of the survey..."
                />
              </div>

              <div className="bg-bg-main p-4 rounded-lg border border-border">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-text-primary">Questions</h3>
                  <Button
                    variant="secondary"
                    className="text-xs h-8"
                    onClick={() => {
                      setNewQuestions(
                        DEFAULT_QUESTIONS.map((q, i) => ({
                          text: q,
                          type: "rating",
                          order: i + 1,
                        }))
                      );
                    }}
                  >
                    Load Template
                  </Button>
                </div>

                {newQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-bg-card p-3 rounded mb-2 border border-border"
                  >
                    <span className="text-sm text-text-primary font-medium">
                      {idx + 1}. {q.text}
                    </span>
                    <div className="flex gap-2">
                      <Tooltip content="Edit Question">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingQuestionIndex(idx);
                            setNewQuestionText(q.text);
                          }}
                          className="text-brand-primary hover:bg-brand-primary/10 p-1 rounded"
                        >
                          <Pencil size={16} />
                        </button>
                      </Tooltip>
                      <Tooltip content="Remove Question">
                        <button
                          type="button"
                          onClick={() => removeQuestion(idx)}
                          className="text-status-error hover:bg-status-error/10 p-1 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                ))}

                <div className="flex gap-2 mt-4">
                  <input
                    type="text"
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    className="flex-1 px-3 py-2 bg-bg-input border border-border rounded-lg"
                    placeholder="Type a question..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddQuestion();
                      }
                    }}
                  />
                  {editingQuestionIndex !== null && (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditingQuestionIndex(null);
                        setNewQuestionText("");
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button onClick={handleAddQuestion} variant="secondary">
                    {editingQuestionIndex !== null ? "Update" : "Add"}
                  </Button>
                </div>
              </div>

              <div className="flex gap-4 pt-4 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingForm(null);
                    setEditingQuestionIndex(null);
                    setNewQuestionText("");
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateForm} isLoading={creatingForm}>
                  {editingForm ? "Save Changes" : "Publish Survey"}
                </Button>
              </div>
            </div>
          </Modal>

          {/* Respond View (User) */}
          {viewMode === "respond" && selectedForm && (
            <div className="max-w-4xl mx-auto space-y-6">
              <Button
                variant="ghost"
                onClick={() => setViewMode("list")}
                leftIcon={<ChevronLeft size={16} />}
              >
                Back to Surveys
              </Button>

              <div className="bg-bg-card border border-border rounded-xl p-8 shadow-sm">
                <div className="mb-8 text-center">
                  <h1 className="text-2xl font-bold text-text-primary mb-2">
                    {selectedForm.title}
                  </h1>
                  <p className="text-text-secondary">
                    {selectedForm.description}
                  </p>
                </div>

                {/* Employee Selector */}
                <div className="mb-8 max-w-md mx-auto">
                  <Select
                    label="Select Colleague to Review"
                    value={targetEmployeeId}
                    onChange={(val) => setTargetEmployeeId(val as string)}
                    options={colleagues.map((emp) => ({
                      value: emp._id,
                      label: `${emp.firstName} ${emp.lastName}`,
                    }))}
                    placeholder="Choose a colleague..."
                    required={true}
                    searchable={true}
                  />
                </div>

                {/* Rating Definitions */}
                <div className="bg-brand-secondary/10 border border-brand-secondary/20 p-4 rounded-lg mb-8 text-sm text-text-secondary">
                  <h4 className="font-semibold text-brand-secondary mb-2">
                    Rating Definitions
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    <div>1: Never</div>
                    <div>2: Occasionally</div>
                    <div>3: Sometimes</div>
                    <div>4: Most of the time</div>
                    <div>5: Always</div>
                    <div>NE: No Experience</div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-bg-main text-text-secondary font-semibold border-b border-border">
                      <tr>
                        <th className="p-4 w-1/2">Question</th>
                        {["1", "2", "3", "4", "5", "NE"].map((val) => (
                          <th key={val} className="p-4 text-center w-12">
                            {val}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {selectedForm.questions.map((q: any) => (
                        <tr key={q._id} className="hover:bg-bg-main/30">
                          <td className="p-4 font-medium text-text-primary">
                            {q.text}
                          </td>
                          {["1", "2", "3", "4", "5", "NE"].map((val) => (
                            <td key={val} className="p-4 text-center">
                              <input
                                type="radio"
                                name={q._id}
                                value={val}
                                checked={answers[q._id] === val}
                                onChange={(e) =>
                                  setAnswers((prev) => ({
                                    ...prev,
                                    [q._id]: e.target.value,
                                  }))
                                }
                                className="w-4 h-4 text-brand-primary bg-bg-input border-border focus:ring-brand-primary"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Additional Comments Section */}
                <div className="mt-8 bg-bg-main/50 border border-border rounded-lg p-6">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Additional Comments (Optional)
                  </label>
                  <p className="text-xs text-text-secondary mb-3">
                    Share any additional feedback, suggestions, or observations
                    about this colleague.
                  </p>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Type your comments here..."
                    className="w-full px-4 py-3 bg-bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 resize-none text-text-primary placeholder:text-text-muted"
                    rows={5}
                  />
                </div>

                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={handleSurveySubmit}
                    isLoading={submittingResponse}
                    className="px-8"
                  >
                    Submit Response
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Results View (Admin) */}
          {viewMode === "results" && selectedForm && (
            <div className="space-y-6">
              <Button
                variant="ghost"
                onClick={() => setViewMode("list")}
                leftIcon={<ChevronLeft size={16} />}
              >
                Back to Surveys
              </Button>

              <div className="bg-bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-text-primary mb-1">
                      {selectedForm.title}
                    </h1>
                    <p className="text-text-secondary text-sm">
                      Detailed results and peer reviews
                    </p>
                  </div>
                  <Badge variant="default">{responses.length} Responses</Badge>
                </div>

                <Table
                  data={responses}
                  columns={[
                    {
                      header: "Respondent",
                      accessorKey: "respondent.name",
                      render: (resp: any) => (
                        <div className="flex flex-col">
                          <span className="font-medium text-text-primary">
                            {resp.respondent?.name || "Unknown"}
                          </span>
                        </div>
                      ),
                    },
                    {
                      header: "Reviewed Employee",
                      accessorKey: "targetUser", // technically object, but we use render
                      render: (resp: any) =>
                        resp.targetUser ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-xs">
                              {resp.targetUser.firstName[0]}
                              {resp.targetUser.lastName[0]}
                            </div>
                            <span>
                              {resp.targetUser.firstName}{" "}
                              {resp.targetUser.lastName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-text-muted italic">
                            General Survey
                          </span>
                        ),
                    },
                    {
                      header: "Date",
                      accessorKey: "createdAt",
                      render: (resp: any) => (
                        <span className="text-text-secondary">
                          {new Date(resp.createdAt).toLocaleDateString()}
                        </span>
                      ),
                    },
                    {
                      header: "Score",
                      accessorKey: "answers", // using for sorting potentially?
                      render: (resp: any) => {
                        const { average, total } = calculateScore(resp.answers);
                        const avgNum = parseFloat(average);
                        let badgeVariant:
                          | "success"
                          | "warning"
                          | "error"
                          | "default" = "default";
                        if (avgNum >= 4) badgeVariant = "success";
                        else if (avgNum >= 3) badgeVariant = "warning";
                        else if (avgNum > 0) badgeVariant = "error";

                        return (
                          <div className="flex items-center gap-3">
                            <Badge variant={badgeVariant}>{average} / 5</Badge>
                            <span className="text-xs text-text-muted">
                              ({total} pts)
                            </span>
                          </div>
                        );
                      },
                    },
                    {
                      header: "Actions",
                      render: (resp: any) => (
                        <Button
                          variant="secondary"
                          onClick={() => setSelectedResponse(resp)}
                          className="h-8 text-xs"
                        >
                          View Details
                        </Button>
                      ),
                    },
                  ]}
                  emptyMessage="No responses received yet."
                />
              </div>
            </div>
          )}

          {/* Response Details Modal */}
          {selectedResponse && selectedForm && (
            <Modal
              isOpen={!!selectedResponse}
              onClose={() => setSelectedResponse(null)}
              title="Response Details"
              maxWidth="max-w-2xl"
              footer={
                <div className="flex justify-end w-full">
                  <Button
                    variant="secondary"
                    onClick={() => setSelectedResponse(null)}
                  >
                    Close
                  </Button>
                </div>
              }
            >
              <div className="space-y-4">
                <div className="flex justify-between p-4 bg-bg-main rounded-lg">
                  <div>
                    <p className="text-sm text-text-secondary">Respondent</p>
                    <p className="font-medium text-text-primary">
                      {selectedResponse.respondent?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">
                      Reviewed Employee
                    </p>
                    <p className="font-medium text-text-primary">
                      {selectedResponse.targetUser?.firstName}{" "}
                      {selectedResponse.targetUser?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Date</p>
                    <p className="font-medium text-text-primary">
                      {new Date(
                        selectedResponse.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <h3 className="font-semibold text-text-primary mt-6 mb-2">
                  Questions & Answers
                </h3>
                <div className="space-y-4">
                  {selectedForm.questions.map((q: any) => {
                    // Find answer in the array where questionId matches
                    const answerObj = selectedResponse.answers.find(
                      (a: any) => a.questionId === q._id
                    );
                    const answer = answerObj ? answerObj.ratingValue : null;

                    return (
                      <div
                        key={q._id}
                        className="bg-bg-main/50 p-4 rounded-lg border border-border"
                      >
                        <p className="text-sm text-text-primary mb-2">
                          {q.text}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-text-secondary uppercase">
                            Rating:
                          </span>
                          <span
                            className={`font-bold ${
                              answer === "5" || answer === "4"
                                ? "text-green-500"
                                : answer === "3"
                                ? "text-yellow-500"
                                : "text-red-500"
                            }`}
                          >
                            {answer || "N/A"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Display Comments if available */}
                {selectedResponse.answers[0]?.textValue && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-text-primary mb-2">
                      Additional Comments
                    </h3>
                    <div className="bg-bg-main/50 p-4 rounded-lg border border-border">
                      <p className="text-sm text-text-secondary whitespace-pre-wrap">
                        {selectedResponse.answers[0].textValue}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Modal>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm.show}
        onClose={() =>
          setShowDeleteConfirm({ ...showDeleteConfirm, show: false })
        }
        onConfirm={handleDeleteForm}
        title="Delete Survey"
        message={`Are you sure you want to delete the survey "${showDeleteConfirm.formTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      {/* Success Modal */}
      <ConfirmationModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onConfirm={() => setShowSuccessModal(false)}
        title="Success"
        message={successMessage}
        confirmText="OK"
        variant="success"
        showCancel={false}
      />
    </div>
  );
}
