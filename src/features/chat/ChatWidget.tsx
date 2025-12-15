import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, User, MessagesSquare } from "lucide-react";
import { Input } from "../../components/common/Input";
import { apiService } from "../../services/api.service";
import { useAuth } from "../../context/AuthContext";

type Message = {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
};

export default function ChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Hello! I am your HR AI Assistant. How can I help you regarding company policies today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  if (!user) return null;

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await apiService.askAi(userMessage.text);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: response.answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: "Sorry, I encountered an error while processing your request. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-bg-card rounded-2xl shadow-xl border border-border flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
          {/* Header */}
          <div className="bg-brand-primary p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-full">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">HR Assistant</h3>
                <p className="text-xs text-brand-primary-foreground/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-status-success rounded-full" />
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg-main/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.sender === "user"
                      ? "bg-brand-secondary text-white"
                      : "bg-brand-primary/10 text-brand-primary"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <User size={14} />
                  ) : (
                    <Bot size={14} />
                  )}
                </div>
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                    msg.sender === "user"
                      ? "bg-brand-primary text-white rounded-tr-none"
                      : "bg-bg-card border border-border text-text-primary rounded-tl-none shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                  </p>
                  <span
                    className={`text-[10px] block mt-1 ${
                      msg.sender === "user"
                        ? "text-white/70"
                        : "text-text-muted"
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
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                  <Bot size={14} />
                </div>
                <div className="bg-bg-card border border-border px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-2 h-2 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-2 h-2 bg-brand-primary rounded-full animate-bounce"></span>
                    </div>
                    <span className="text-xs text-text-muted animate-pulse font-medium">
                      Thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSend}
            className="p-4 bg-bg-card border-t border-border"
          >
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about HR policies..."
                  className="bg-bg-main rounded-full px-4 py-2.5 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2.5 bg-brand-primary text-white rounded-full hover:bg-brand-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-[10px] text-text-muted mt-2 ml-2">
              AI can make mistakes. Please verify important info with HR.
            </p>
          </form>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-brand-primary hover:bg-brand-secondary text-white h-14 w-14 rounded-full shadow-lg transition-all duration-200 hover:scale-110 flex items-center justify-center"
        >
          <MessagesSquare size={22} />
        </button>
      )}
    </div>
  );
}
