"use client";

import { useState } from "react";
import { Sparkles, Loader2, X, Plus, Layers, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { AlertModal } from "@/components/ui/AlertModal";

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!rawText.trim()) return;
    setIsAnalyzing(true);
    setErrorMessage(null);
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
      setErrorMessage(err.message || "Failed to analyze Job Description");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!analysisResult) return;
    setIsGenerating(true);
    setErrorMessage(null);
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
      setErrorMessage(err.message || "Failed to generate interview blueprint");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl p-6 sm:p-8 rounded-3xl bg-[#0b1324] border border-[#FF9900]/30 shadow-2xl shadow-[#FF9900]/10 flex flex-col gap-6 relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#FF9900] uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#FF9900]" />
            <span>AI JOB DESCRIPTION INGESTION</span>
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Generate Interview Blueprint from Job Description</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Paste any CloudOps / DevOps job posting below. The AI Engine will extract skill maps, key technologies, and generate a 4-stage structured assessment blueprint with questions.
          </p>
        </div>

        {!analysisResult ? (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">Role Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior DevOps Engineer"
                  className="w-full p-3 rounded-xl bg-slate-900/90 text-slate-100 border border-slate-700/80 focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] text-xs font-medium placeholder:text-slate-500 shadow-inner"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">Seniority Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900/90 text-slate-100 border border-slate-700/80 focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] text-xs font-medium cursor-pointer"
                >
                  <option value="JUNIOR">Junior / Entry Level (0-2 Yrs)</option>
                  <option value="MID">Mid-Level Engineer (2-5 Yrs)</option>
                  <option value="SENIOR">Senior / Lead Architect (5+ Yrs)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">Paste Job Description Text</label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste the full job description, required skills (Kubernetes, AWS, CI/CD, Terraform), tools, and responsibilities here..."
                rows={7}
                className="w-full p-3.5 rounded-xl bg-slate-900/90 text-slate-100 border border-slate-700/80 focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] text-xs font-mono resize-none leading-relaxed placeholder:text-slate-500 shadow-inner"
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!rawText.trim() || isAnalyzing}
              className="py-3.5 px-6 rounded-xl font-black text-xs text-slate-950 bg-gradient-to-r from-[#FF9900] via-amber-500 to-orange-500 hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#FF9900]/25 transition-all uppercase tracking-wider"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>AI Parsing Skills & Extracting 4-Stage Blueprint...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Analyze & Extract Blueprint</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Extracted Skills & Tools */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/30 flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Target Role</span>
                  <p className="text-sm font-black text-white uppercase">{analysisResult.target_role} ({analysisResult.experience_level})</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#FF9900]/20 text-[#FF9900] border border-[#FF9900]/40">
                  AI EXTRACTION COMPLETE
                </span>
              </div>

              <div>
                <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider block mb-2">Identified Skills & Required Technologies:</span>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.skills.map((s: string, idx: number) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                      {s}
                    </span>
                  ))}
                  {analysisResult.technologies.map((t: string, idx: number) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider block mb-2">Generated 4-Stage Blueprint Architecture:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {analysisResult.suggested_stages.map((stg: any) => (
                    <div key={stg.stage_number} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-0.5">
                      <span className="text-[10px] font-mono font-bold text-[#FF9900] uppercase">Stage {stg.stage_number}</span>
                      <p className="text-xs font-bold text-white truncate">{stg.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setAnalysisResult(null)}
                className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider"
              >
                Back to Edit
              </button>
              <button
                onClick={handleCreateTemplate}
                disabled={isGenerating}
                className="py-3 px-6 rounded-xl font-black text-xs text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:brightness-110 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-500/25 uppercase tracking-wider transition-all"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Generating Questions & Stages...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    <span>Create & Publish Blueprint</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <AlertModal
        isOpen={!!errorMessage}
        title="Blueprint Error"
        message={errorMessage || ""}
        type="error"
        onClose={() => setErrorMessage(null)}
      />
    </div>

  );
}
