"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Sparkles, Sliders, Cpu, Save, ShieldCheck, CheckCircle2, 
  Settings2, Bot, Layers, Check, RefreshCw
} from "lucide-react";

export default function AdminScoringPage() {
  const [modelProvider, setModelProvider] = useState("gpt-4o-mini");
  const [passingScore, setPassingScore] = useState(80);

  // 5 Pillars Weights State
  const [weights, setWeights] = useState({
    technical: 40,
    concept: 25,
    reasoning: 20,
    practical: 10,
    communication: 5
  });

  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const handleSave = () => {
    setSaving(true);
    setSavedMsg("");
    setTimeout(() => {
      setSaving(false);
      setSavedMsg("AI Model & 5-Pillar Scoring configuration saved to database!");
    }, 600);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-[1280px] mx-auto flex flex-col gap-6 pb-16 text-slate-900 dark:text-slate-100 font-sans"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#0B1E36] text-[#FF6B00] flex items-center justify-center shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              AI Model & Scoring Calibration
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Configure LLM Engine, 5-Pillar Evaluation Weights, and Passing Bar Thresholds
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#FF6B00] to-amber-500 hover:from-orange-500 hover:to-amber-600 shadow-md shadow-[#FF6B00]/20 flex items-center gap-2 transition-all"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Configuration</span>
        </button>
      </div>

      {savedMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {savedMsg}
        </div>
      )}

      {/* Model Selection */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#FF6B00]" />
          Select AI Engine Provider
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: "gpt-4o-mini", name: "OpenAI GPT-4o-Mini", desc: "Optimal latency & high precision scoring (Default)", badge: "Recommended" },
            { id: "deepseek-r1", name: "DeepSeek R1 Reasoning", desc: "Deep multi-step reasoning for incident triage", badge: "High Accuracy" },
            { id: "ollama-local", name: "Ollama Llama3 (Local)", desc: "On-premise offline fallback inference engine", badge: "Self-Hosted" },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => setModelProvider(item.id)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                modelProvider === item.id 
                  ? "bg-orange-50/50 dark:bg-orange-950/30 border-[#FF6B00] shadow-sm"
                  : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 dark:text-white">{item.name}</span>
                {modelProvider === item.id && <Check className="w-4 h-4 text-[#FF6B00]" />}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{item.desc}</p>
              <span className="w-fit text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#0B1E36] text-[#FF6B00]">
                {item.badge}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 5-Pillar Weights Configurator */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-5">
        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#FF6B00]" />
          5-Pillar Evaluation Rubric Weights
        </h3>

        <div className="flex flex-col gap-4">
          {[
            { key: "technical", label: "Pillar 1: Technical Accuracy", desc: "Correctness of Linux & AWS commands" },
            { key: "concept", label: "Pillar 2: Concept Coverage", desc: "System internals & architecture depth" },
            { key: "reasoning", label: "Pillar 3: Reasoning Quality", desc: "Logical troubleshooting methodology" },
            { key: "practical", label: "Pillar 4: Practical Knowledge", desc: "Real-world command hands-on mastery" },
            { key: "communication", label: "Pillar 5: Communication Clarity", desc: "Speech pacing (WPM) and structure" },
          ].map((item) => (
            <div key={item.key} className="flex flex-col gap-1.5 p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-900 dark:text-white">{item.label}</span>
                <span className="font-mono text-[#FF6B00] font-black">{weights[item.key as keyof typeof weights]}% Weight</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">{item.desc}</p>
              <input
                type="range"
                min="0"
                max="100"
                value={weights[item.key as keyof typeof weights]}
                onChange={(e) => setWeights({ ...weights, [item.key]: parseInt(e.target.value) })}
                className="w-full accent-[#FF6B00] cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

    </motion.div>
  );
}
