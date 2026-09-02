"use client";

import { useEffect, useState } from "react";
import { 
  Terminal, Sparkles, Plus, Layers, BookOpen, 
  CheckCircle2, ChevronDown, ChevronUp, Loader2, ArrowLeft 
} from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { InterviewTemplate } from "@/types";
import { JDParserModal } from "@/components/admin/JDParserModal";

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<InterviewTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJDModalOpen, setIsJDModalOpen] = useState(false);
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);

  const loadTemplates = async () => {
    try {
      const res = await apiFetch("/interviews/templates");
      setTemplates(res.data || []);
      if (res.data && res.data.length > 0) {
        setExpandedTemplateId(res.data[0].id);
      }
    } catch (e) {
      console.warn("Failed to load templates:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
            <Terminal className="w-4 h-4" />
            <span>Interview Blueprint Bank</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Assessment Blueprints & Question Bank
          </h1>
          <p className="text-xs text-slate-400 mt-1">Configure 4-stage interview architectures, reference answers, and evaluation rubrics.</p>
        </div>

        <button
          onClick={() => setIsJDModalOpen(true)}
          className="px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:opacity-90 shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ingest New Job Description</span>
        </button>
      </div>

      {/* Templates List */}
      <div className="flex flex-col gap-4">
        {templates.map((tpl) => {
          const isExpanded = expandedTemplateId === tpl.id;

          return (
            <div
              key={tpl.id}
              className="rounded-3xl glass-panel border border-white/10 overflow-hidden transition-all"
            >
              {/* Template Header Accordion */}
              <div
                onClick={() => setExpandedTemplateId(isExpanded ? null : tpl.id)}
                className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-indigo-500/20 text-indigo-300">
                        {tpl.target_role}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {tpl.stages?.length || 4} Stages
                      </span>
                      <span className="text-xs font-mono text-emerald-400">
                        Passing Bar: {tpl.passing_score}%
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{tpl.title}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 hidden sm:inline">
                    {isExpanded ? "Collapse blueprint" : "Expand blueprint"}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Stages and Questions Viewer */}
              {isExpanded && (
                <div className="p-6 pt-0 border-t border-white/5 flex flex-col gap-6 bg-slate-950/40">
                  <p className="text-xs text-slate-400 leading-relaxed max-w-3xl mt-4">
                    {tpl.description}
                  </p>

                  <div className="flex flex-col gap-4">
                    {tpl.stages?.map((stage) => (
                      <div
                        key={stage.id}
                        className="p-5 rounded-2xl bg-slate-900/80 border border-white/5 flex flex-col gap-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-indigo-600/20 text-indigo-300">
                              Stage {stage.stage_number}
                            </span>
                            <h4 className="text-sm font-bold text-white">{stage.title}</h4>
                            <span className="text-xs font-mono text-cyan-400">({stage.category})</span>
                          </div>
                          <span className="text-xs font-mono text-slate-400">Min Score: {stage.minimum_score}%</span>
                        </div>

                        <p className="text-xs text-slate-400">{stage.description}</p>

                        {/* Questions list */}
                        {stage.questions && stage.questions.length > 0 && (
                          <div className="flex flex-col gap-2 mt-2">
                            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                              Configured Technical Questions ({stage.questions.length}):
                            </span>
                            {stage.questions.map((q, qIdx) => (
                              <div
                                key={q.id}
                                className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-2 text-xs"
                              >
                                <div className="flex items-center justify-between font-semibold text-white">
                                  <span>Q{qIdx + 1}: &ldquo;{q.question_text}&rdquo;</span>
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300">
                                    {q.question_type} • {q.difficulty}
                                  </span>
                                </div>

                                {q.expected_topics && (
                                  <div className="flex flex-wrap gap-1 items-center">
                                    <span className="text-[10px] font-mono text-slate-400">Target Concepts:</span>
                                    {q.expected_topics.map((t, tIdx) => (
                                      <span key={tIdx} className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300">
                                        {t}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {q.reference_answer && (
                                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-white/5 text-[11px] text-slate-300 leading-relaxed">
                                    <strong className="text-amber-400 font-mono block mb-0.5">Reference Benchmark Standard:</strong>
                                    {q.reference_answer}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <JDParserModal
        isOpen={isJDModalOpen}
        onClose={() => setIsJDModalOpen(false)}
        onSuccess={() => {
          loadTemplates();
          alert("New assessment blueprint created successfully!");
        }}
      />
    </div>
  );
}
