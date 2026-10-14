"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, Sparkles, X, MessageSquare } from "lucide-react";
import type { ChatMessage } from "@/lib/types";

interface AICoachProps {
  sessionId: string;
  isOpen: boolean;
  onToggle: () => void;
  mode: "sidebar" | "floating";
}

export function AICoach({ sessionId, isOpen, onToggle, mode }: AICoachProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat history and initialize
  useEffect(() => {
    if (!isOpen || initialized) return;

    async function init() {
      try {
        // Load existing messages
        const res = await fetch(`/api/chat?sessionId=${sessionId}`);
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          setMessages(
            data.messages.map((m: { id: string; role: string; content: string; createdAt: string }) => ({
              id: m.id,
              role: m.role as "user" | "assistant",
              content: m.content,
              createdAt: m.createdAt,
            }))
          );
        } else {
          // Send initial message
          const initRes = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId, isInitial: true }),
          });
          const initData = await initRes.json();
          if (initData.message) {
            setMessages([
              {
                id: initData.message.id,
                role: "assistant",
                content: initData.message.content,
                createdAt: initData.message.createdAt,
              },
            ]);
          }
        }
      } catch {
        // ignore
      }
      setInitialized(true);
    }

    init();
  }, [isOpen, initialized, sessionId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: userMsg.content }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages((prev) => [
          ...prev,
          {
            id: data.message.id,
            role: "assistant",
            content: data.message.content,
            createdAt: data.message.createdAt,
          },
        ]);
      }
    } catch {
      // ignore
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const suggestedQuestions = [
    "How do I improve my aim?",
    "Best building practice routine?",
    "How to win endgame?",
    "Tips for my weaknesses?",
  ];

  // Floating button when closed
  if (!isOpen && mode === "floating") {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-accent to-accent-blue text-white flex items-center justify-center shadow-lg hover:shadow-[0_0_30px_rgba(108,92,231,0.4)] transition-all hover:scale-110"
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>
    );
  }

  const chatContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-blue flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Coach</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-text-muted">Online</span>
            </div>
          </div>
        </div>
        {mode === "floating" && (
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${
                msg.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  msg.role === "assistant"
                    ? "bg-accent/10 text-accent"
                    : "bg-accent-cyan/10 text-accent-cyan"
                }`}
              >
                {msg.role === "assistant" ? (
                  <Sparkles className="w-3.5 h-3.5" />
                ) : (
                  <User className="w-3.5 h-3.5" />
                )}
              </div>
              <div
                className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed ${
                  msg.role === "assistant"
                    ? "bg-bg-secondary border border-border/50 text-text-primary"
                    : "bg-accent/20 border border-accent/20 text-text-primary"
                }`}
              >
                {msg.content.split("\n").map((line, i) => {
                  if (line.startsWith("**") && line.endsWith("**")) {
                    return (
                      <p key={i} className="font-bold text-accent-light mb-1">
                        {line.replace(/\*\*/g, "")}
                      </p>
                    );
                  }
                  if (line.startsWith("**")) {
                    const parts = line.split("**");
                    return (
                      <p key={i} className="mb-1">
                        {parts.map((part, j) =>
                          j % 2 === 1 ? (
                            <strong key={j} className="text-accent-light">
                              {part}
                            </strong>
                          ) : (
                            <span key={j}>{part}</span>
                          )
                        )}
                      </p>
                    );
                  }
                  if (line.startsWith("- ") || line.match(/^\d+\./)) {
                    return (
                      <p key={i} className="ml-2 mb-0.5">
                        {line}
                      </p>
                    );
                  }
                  if (line.trim() === "") return <br key={i} />;
                  return (
                    <p key={i} className="mb-1">
                      {line}
                    </p>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-7 h-7 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="p-3 rounded-xl bg-bg-secondary border border-border/50">
              <Loader2 className="w-4 h-4 animate-spin text-accent" />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested questions (only when few messages) */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => {
                  setInput(q);
                  setTimeout(() => sendMessage(), 100);
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-bg-tertiary text-text-secondary hover:text-text-primary hover:bg-bg-hover border border-border/50 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder="Ask your coach anything..."
            className="flex-1 px-4 py-3 bg-bg-secondary border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className={`px-4 py-3 rounded-xl transition-all ${
              input.trim() && !loading
                ? "bg-accent text-white hover:bg-accent-dark"
                : "bg-bg-tertiary text-text-muted cursor-not-allowed"
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  if (mode === "floating") {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] max-h-[80vh] bg-bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {chatContent}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Sidebar mode
  return (
    <div className="h-full bg-bg-card border-l border-border flex flex-col">
      {chatContent}
    </div>
  );
}
