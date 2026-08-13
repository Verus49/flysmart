import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  Loader2, 
  ArrowRight, 
  AlertTriangle,
  HelpCircle,
  Clock
} from "lucide-react";

const SUGGESTED_QUESTIONS = [
  { text: "Why Golang over Node.js for search?", label: "Go vs Node" },
  { text: "How does Flink spot mistake fares in real-time?", label: "Mistake Fares" },
  { text: "Explain Cloud Spanner global ACID consistency.", label: "Global Sync" },
  { text: "Describe the active-active failover steps.", label: "Failover SLA" }
];

export default function ArchitectChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      text: "Welcome! I am **FlySmart's Chief Software Architect**. I designed our global, event-driven, multi-tier flight intelligence blueprint. Ask me anything about our microservices topology, database consistency guarantees, Apache Kafka ingestion rates, Flink mistake fare triggers, or future roadmap expansions. I will provide high-fidelity technical answers without simplifying.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      // Map state history to endpoint expected schema
      const historyPayload = messages.slice(1).map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned status code ${res.status}`);
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const modelMessage: ChatMessage = {
        id: Math.random().toString(),
        role: "model",
        text: data.text || "I was unable to formulate a response.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (err: any) {
      console.error(err);
      setError("Failed to reach the Chief Architect on the server-side proxy. Confirm GEMINI_API_KEY is configured.");
    } finally {
      setLoading(false);
    }
  };

  const parseMarkdown = (text: string) => {
    // Simple parser for bold words and bullet listings to maintain pristine typography
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let trimmed = line.trim();
      let isBullet = trimmed.startsWith("-") || trimmed.startsWith("*");
      if (isBullet) {
        trimmed = trimmed.substring(1).trim();
      }

      // Replace bold markdown with HTML bold
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parsedHTML = trimmed.replace(boldRegex, '<strong class="font-bold text-sky-400">$1</strong>');

      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc text-slate-300 pl-1 my-1.5 leading-relaxed" dangerouslySetInnerHTML={{ __html: parsedHTML }} />
        );
      }
      return (
        <p key={idx} className="my-2 text-slate-300 leading-relaxed text-xs" dangerouslySetInnerHTML={{ __html: parsedHTML }} />
      );
    });
  };

  return (
    <div className="flex flex-col h-[580px] bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
      {/* Panel Header */}
      <div className="bg-slate-950/40 border-b border-slate-800 p-4 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-950/60 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-100 leading-none">AI Chief Architect</span>
              <span className="flex items-center gap-1 text-[9px] bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full font-mono">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span> ONLINE
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-1">FlySmart Systems Blueprint Specialist</p>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
          <Clock className="w-3.5 h-3.5 text-sky-500" />
          <span>SLA: &lt; 2s</span>
        </div>
      </div>

      {/* Messages Scroll Grid */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 max-w-[85%] ${m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
          >
            {/* Avatar icon */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
              m.role === "user" 
                ? "bg-slate-800 border-slate-700 text-slate-300" 
                : "bg-sky-950/50 border-sky-500/30 text-sky-400"
            }`}>
              {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className={`rounded-2xl p-4 text-xs ${
              m.role === "user"
                ? "bg-sky-600/20 border border-sky-500/20 text-slate-200 rounded-tr-none"
                : "bg-slate-950/50 border border-slate-800/80 text-slate-300 rounded-tl-none"
            }`}>
              <div className="space-y-1">{parseMarkdown(m.text)}</div>
              <div className="text-[8px] text-slate-500 font-mono text-right mt-2 uppercase">
                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="w-8 h-8 rounded-lg bg-sky-950/50 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-950/50 border border-slate-800/80 text-slate-500 rounded-2xl rounded-tl-none p-4 text-xs italic flex items-center gap-2">
              <span>Architect is analyzing system boundaries and formulating response...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-3.5 text-xs text-rose-300 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
            <div className="space-y-1">
              <p className="font-semibold">Architect Communication Outage</p>
              <p className="text-[10px] text-rose-400/95 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Block */}
      <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-950/20 flex flex-wrap gap-2 shrink-0">
        <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono uppercase mr-1">
          <Sparkles className="w-3 h-3 text-sky-400" /> Consult:
        </span>
        {SUGGESTED_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q.text)}
            disabled={loading}
            className="text-[10px] bg-slate-900 border border-slate-800 hover:border-sky-500/50 hover:bg-sky-950/10 text-slate-300 hover:text-sky-400 px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium disabled:opacity-50"
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-3 bg-slate-950/40 border-t border-slate-800 flex gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Query the Chief Architect (e.g., 'How do we design the Kafka event payload?')"
          disabled={loading}
          className="flex-1 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-sky-600 hover:bg-sky-500 text-slate-100 font-semibold px-4 py-2.5 rounded-xl text-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
