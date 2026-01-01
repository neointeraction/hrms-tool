import React, { useState, useRef, useEffect } from "react";
import { agentService } from "../services/agent.service";
import type { AgentResponse } from "../services/agent.service";
import {
  Send,
  Bot,
  X,
  MessageSquare,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "agent";
  text: string;
  actions?: AgentResponse["actions"];
  timestamp: Date;
}

export const AgentChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "agent",
      text: "Hello! I am your AI HR Assistant. I can help you onboard employees, approve leaves, and more. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await agentService.executeCommand(userMsg.text);

      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        text:
          response.answer ||
          "I completed the task but didn't have anything to say.",
        actions: response.actions,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentMsg]);
    } catch (error: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        text: `Sorry, I encountered an error: ${error.message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[400px] h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6" />
              <div>
                <h3 className="font-semibold text-sm">HR Assistant</h3>
                <div className="flex items-center gap-1.5 opacity-80">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs">Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    msg.role === "user"
                      ? "bg-violet-600 text-white rounded-br-none"
                      : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                  </p>

                  {/* Action Cards */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.actions.map((action, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                            action.status === "success"
                              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                          }`}
                        >
                          {action.status === "success" ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 overflow-hidden">
                            <p
                              className={`font-medium mb-1 ${
                                action.status === "success"
                                  ? "text-green-700 dark:text-green-300"
                                  : "text-red-700 dark:text-red-300"
                              }`}
                            >
                              {action.tool === "get_employee_details"
                                ? "Found Employee"
                                : action.tool === "create_employee"
                                ? "Employee Created"
                                : action.tool === "approve_leave"
                                ? "Leave Approved"
                                : "Task Completed"}
                            </p>
                            <pre className="opacity-80 overflow-x-auto">
                              {typeof action.output === "object"
                                ? JSON.stringify(action.output, null, 2) // Pretty print JSON
                                : String(action.output).substring(0, 100) +
                                  (String(action.output).length > 100
                                    ? "..."
                                    : "")}
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <span
                    className={`text-[10px] mt-1 block opacity-60 ${
                      msg.role === "user" ? "text-violet-100" : "text-gray-400"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start">
                <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-none px-4 py-3 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-violet-600 animate-spin" />
                    <span className="text-xs text-gray-500">
                      Processing request...
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSubmit}
            className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a command (e.g., 'Onboard John')..."
                className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all dark:text-white placeholder:text-gray-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:hover:bg-violet-600 transition-colors shadow-lg shadow-violet-200 dark:shadow-none"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${
          isOpen
            ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white animate-bounce-slow"
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageSquare className="w-6 h-6" />
        )}
      </button>
    </div>
  );
};
