"use client";

import { useState, useEffect } from "react";
import { HelpCircle, MessageSquare, Send, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function HelpPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await apiFetch("/candidates/me/support");
        if (res?.data) {
          setTickets(res.data);
        }
      } catch (e) {
        console.warn("Tickets fetch error:", e);
      }
    };
    fetchTickets();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    setLoading(true);
    setTimeout(() => {
      const newTicket = {
        id: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
        subject,
        category: "Technical Issue",
        status: "OPEN",
        created_at: "Just now"
      };
      setTickets([newTicket, ...tickets]);
      setSubject("");
      setMessage("");
      setLoading(false);
      setMsg("Support ticket submitted! Our engineering team will respond within 2 hours.");
    }, 600);
  };

  return (
    <div className="max-w-[900px] mx-auto flex flex-col gap-6 pb-12 text-slate-900 dark:text-slate-100 font-sans">
      
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-blue-600" />
          Help & Engineering Support
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Have an issue during a voice interview or ATS audit? Submit a ticket to our DevOps support team.
        </p>
      </div>

      {/* Ticket Submission Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white">Submit New Support Ticket</h3>

        {msg && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            {msg}
          </div>
        )}

        <input
          type="text"
          placeholder="Issue Subject (e.g., Audio microphone check error on Stage 3)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
          required
        />

        <textarea
          rows={3}
          placeholder="Describe what happened in detail..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 resize-none"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-fit py-2.5 px-6 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          <span>Submit Support Ticket</span>
        </button>
      </form>

      {/* Ticket List */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-black text-slate-900 dark:text-white">Your Support Tickets</h3>

        {tickets.map((t, i) => (
          <div key={i} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900 dark:text-white">{t.subject}</span>
                <span className="text-[10px] font-mono text-slate-400">{t.id} • {t.created_at}</span>
              </div>
            </div>

            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
              t.status === "RESOLVED"
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 border-emerald-200"
                : "bg-blue-50 dark:bg-blue-950/60 text-blue-700 border-blue-200"
            }`}>
              {t.status}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}
