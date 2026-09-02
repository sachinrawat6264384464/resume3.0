"use client";

import { useState } from "react";
import { Sparkles, Loader2, X, Plus, Layers, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface JDParserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function JDParserModal({ isOpen, onClose, onSuccess }: JDParserModalProps) {
  const [title, setTitle] = useState("DevOps Engineer");
  const [experienceLevel, setExperienceLevel] = useState("MID");
  const [rawText, setRawText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!rawText.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await apiFetch("/job-descriptions/analyze", {
        method: "POST",
        body: JSON.stringify({
          title,
          raw_description: rawText,
          experience_level: experienceLevel
        })
      });
      setAnalysisResult(res.data);
    } catch (err: any) {
      alert(err.message || "Failed to analyze Job Description");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!analysisResult) return;
    setIsGenerating(true);
    try {
      // 1. Create JD
      const jdRes = await apiFetch("/job-descriptions", {
        method: "POST",
        body: JSON.stringify({
          title: analysisResult.title || title,
          raw_description: rawText,
          target_role: analysisResult.target_role || "CloudOps Engineer",
          experience_level: analysisResult.experience_level || experienceLevel,
          skills_json: analysisResult.skills || [],
          technologies_json: analysisResult.technologies || [],
          responsibilities_json: analysisResult.responsibilities || []
        })
      });

      // 2. Generate Full 4-Stage Interview Template Blueprint from JD
      await apiFetch(`/job-descriptions/${jdRes.data.id}/generate-template`, {
        method: "POST"
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || "Failed to generate interview blueprint");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl p-6 sm:p-8 rounded-3xl glass-panel-glow border border-white/10 flex flex-col gap-6 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>AI Job Description Ingestion</span>
          </div>
          <h2 className="text-xl font-bold text-white">Generate Interview Blueprint from Job Description</h2>
          <p className="text-xs text-slate-400 mt-1">Paste any CloudOps/DevOps job posting. The AI will extract skill maps and generate 4 structured assessment stages with questions.</p>
        </div>

        {!analysisResult ? (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Role Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Seniority Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-xs bg-slate-900"
                >
                  <option value="JUNIOR">Junior / Entry</option>
                  <option value="MID">Mid-Level</option>
                  <option value="SENIOR">Senior / Lead</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Paste Job Description Text</label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste the full job description, required skills, tools, and responsibilities here..."
                rows={7}
                className="w-full p-3 rounded-xl glass-input text-xs font-mono resize-none leading-relaxed"
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!rawText.trim() || isAnalyzing}
              className="py-3 px-6 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-indigo-600 to-cyan-500 hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI Parsing Skills & Stage Blueprint...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze & Extract Blueprint</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Extracted Skills & Tools */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 flex flex-col gap-3">
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Target Role:</span>
                <p className="text-sm font-semibold text-white">{analysisResult.target_role} ({analysisResult.experience_level})</p>
              </div>

              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">Identified Skills & Tools:</span>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.skills.map((s: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {s}
                    </span>
                  ))}
                  {analysisResult.technologies.map((t: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">4-Stage Blueprint Architecture:</span>
                <div className="grid grid-cols-2 gap-2">
                  {analysisResult.suggested_stages.map((stg: any) => (
                    <div key={stg.stage_number} className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-[10px] font-mono text-indigo-400">Stage {stg.stage_number}</span>
                      <p className="text-xs font-medium text-white truncate">{stg.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setAnalysisResult(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Back to Edit
              </button>
              <button
                onClick={handleCreateTemplate}
                disabled={isGenerating}
                className="py-2.5 px-6 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-90 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-600/30"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Questions & Stages...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Create & Publish Blueprint</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
