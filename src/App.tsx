import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Loader2, ClipboardType, BookOpen, CheckCircle2, ArrowRightCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "model";
  text: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial greeting
    setMessages([
      {
        role: "model",
        text: "Confirming the module: **Create Digital Content, Communicate and Collaborate Online**. Please paste the first page text, video transcript, or quiz question to get started immediately."
      }
    ]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, history }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setMessages((prev) => [...prev, { role: "model", text: data.text }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "⚠️ **Error:** Something went wrong. Please check your connection and try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cisco-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-cisco-blue/20">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-slate-800 leading-tight">CiscoInternBot</h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Cisco Digital Literacy Assistant</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-100">
            <CheckCircle2 size={14} />
            Module: Active
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-cisco-blue rounded-full text-xs font-semibold border border-blue-100">
            <Sparkles size={14} />
            Speed Mode: ON
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col max-w-4xl w-full mx-auto relative group">
        {/* Messages Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-8 space-y-6 custom-scrollbar"
        >
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-1 border shadow-sm ${
                  msg.role === "user" 
                    ? "bg-white text-slate-600 border-slate-200" 
                    : "bg-cisco-blue text-white border-cisco-blue/10"
                }`}>
                  {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`max-w-[85%] px-5 py-4 rounded-2xl shadow-sm ${
                  msg.role === "user"
                    ? "bg-slate-800 text-white rounded-tr-none"
                    : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                }`}>
                  <div className="markdown-body">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-cisco-blue flex items-center justify-center text-white animate-pulse">
                <Bot size={16} />
              </div>
              <div className="bg-white border border-slate-200 px-5 py-4 rounded-2xl rounded-tl-none shadow-sm text-slate-400 italic flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Intern bot is processing...
              </div>
            </div>
          )}
        </div>

        {/* Action Indicators - Quick Paste Suggestions */}
        {messages.length === 1 && !isLoading && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-8 text-center space-y-6 pointer-events-none">
             <div className="p-8 bg-white/80 backdrop-blur rounded-3xl border border-slate-200 shadow-2xl space-y-4 pointer-events-auto max-w-sm mx-auto">
                <BookOpen className="w-12 h-12 text-cisco-blue mx-auto" />
                <h2 className="text-xl font-bold text-slate-800 font-display">Ready to Assist</h2>
                <p className="text-sm text-slate-600">Paste your course content here to get summaries, actions, and quiz answers instantly.</p>
                <div className="flex flex-col gap-2">
                  <button onClick={() => setInput("Page Title: Working with Digital Documents...")} className="group/btn px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors pointer-events-auto">
                    <span className="text-xs font-bold text-slate-400 block uppercase">Example</span>
                    <span className="text-sm font-medium text-slate-700 flex items-center justify-between">
                      Paste Page Text <ArrowRightCircle size={16} className="text-slate-300 group-hover/btn:text-cisco-blue transition-colors" />
                    </span>
                  </button>
                  <button onClick={() => setInput("Transcript: Welcome to module 1. In this video we will...")} className="group/btn px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors pointer-events-auto">
                    <span className="text-xs font-bold text-slate-400 block uppercase">Example</span>
                    <span className="text-sm font-medium text-slate-700 flex items-center justify-between">
                      Paste Transcript <ArrowRightCircle size={16} className="text-slate-300 group-hover/btn:text-cisco-blue transition-colors" />
                    </span>
                  </button>
                </div>
             </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-transparent border-t border-slate-200/50">
          <form 
            onSubmit={handleSend}
            className="relative bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 p-2 flex items-end gap-2 focus-within:ring-2 focus-within:ring-cisco-blue/20 transition-all"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Paste page content, transcript or quiz question..."
              className="flex-1 bg-transparent border-0 focus:ring-0 text-slate-800 placeholder-slate-400 py-3 px-4 resize-none min-h-[56px] max-h-60 text-sm"
              rows={1}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3 bg-cisco-blue hover:bg-cisco-dark disabled:bg-slate-200 text-white rounded-xl transition-all shadow-lg shadow-cisco-blue/20 disabled:shadow-none flex-shrink-0"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </form>
          <p className="text-[10px] text-center mt-3 text-slate-400 font-medium uppercase tracking-widest">
            Expertly crafted for Cisco Digital Literacy • Speed & Accuracy First
          </p>
        </div>
      </main>
    </div>
  );
}
