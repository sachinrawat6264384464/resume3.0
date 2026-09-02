"use client";

import { useState, useEffect } from "react";
import { 
  Zap, Mic, Sparkles, CheckCircle2, AlertTriangle, 
  Lightbulb, Lock, Unlock, ArrowRight, RotateCcw, 
  Play, Volume2, ShieldAlert, Star, Flame, Loader2, BookOpen
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { speakText } from "@/lib/media-recorder";
import { QuestionEvaluationResult } from "@/types";

const PRACTICE_TOPICS = [
  { id: "linux", name: "🐧 Linux Systems", role: "Linux Systems Engineer", defaultQ: "How do you investigate high disk I/O wait and identify which Linux process is causing heavy disk read/write operations?" },
  { id: "aws", name: "☁️ AWS & Multi-Cloud", role: "AWS Cloud Engineer", defaultQ: "Explain how AWS IAM Roles differ from IAM Users, and why IAM Roles with STS assume-role should be preferred for applications running on EC2 or EKS." },
  { id: "k8s", name: "🚀 Docker & Kubernetes", role: "DevOps Engineer", defaultQ: "Explain step-by-step how you would troubleshoot a Kubernetes pod that is continuously stuck in a CrashLoopBackOff state in production." },
  { id: "terraform", name: "⚙️ Terraform IaC", role: "Platform Engineer", defaultQ: "How do you prevent concurrent state file corruption when multiple engineers apply Terraform changes simultaneously in team environments?" },
  { id: "devsecops", name: "🛡️ DevSecOps", role: "DevSecOps Engineer", defaultQ: "How do you integrate container vulnerability scanning with Trivy into a CI/CD pipeline and enforce deployment gate blocking for Critical CVEs?" },
  { id: "troubleshooting", name: "🔥 Live Outage Boss", role: "Site Reliability Engineer", defaultQ: "Users report receiving HTTP 502 Bad Gateway and 504 Gateway Timeout errors when visiting a web application behind an Nginx Ingress Controller. How do you isolate the root cause?" }
];

export default function QuickPracticePage() {
  const [selectedTopic, setSelectedTopic] = useState(PRACTICE_TOPICS[0]);
  const [currentQuestion, setCurrentQuestion] = useState(PRACTICE_TOPICS[0].defaultQ);
  const [candidateAnswer, setCandidateAnswer] = useState("");
  const [durationSeconds, setDurationSeconds] = useState(30);

  const [hintLevelUnlocked, setHintLevelUnlocked] = useState<number>(0);
  const [showHints, setShowHints] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [evalResult, setEvalResult] = useState<QuestionEvaluationResult | null>(null);
  const [xpToast, setXpToast] = useState<string | null>(null);

  // Play audio on question change
  const playAudio = () => {
    speakText(
      currentQuestion,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const handleSelectTopic = (topic: typeof PRACTICE_TOPICS[0]) => {
    setSelectedTopic(topic);
    setCurrentQuestion(topic.defaultQ);
    setCandidateAnswer("");
    setEvalResult(null);
    setHintLevelUnlocked(0);
    setShowHints(false);
  };

  const handleGenerateNextQuestion = async () => {
    setIsGenerating(true);
    setEvalResult(null);
    setCandidateAnswer("");
    setHintLevelUnlocked(0);

    try {
      const res = await apiFetch("/questions/generate-ai", {
        method: "POST",
        body: JSON.stringify({
          role: selectedTopic.role,
          stage_title: selectedTopic.name,
          topic: selectedTopic.name,
          difficulty: "INTERMEDIATE",
          question_type: "PRACTICAL",
          count: 1
        })
      });

      if (res.data && res.data.length > 0) {
        setCurrentQuestion(res.data[0].question_text);
      }
    } catch (e: any) {
      alert("Failed to generate question: " + (e.message || "Server error"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!candidateAnswer.trim()) {
      alert("Please provide an answer before submitting.");
      return;
    }

    setIsEvaluating(true);
    try {
      const res = await apiFetch("/questions/quick-practice-evaluate", {
        method: "POST",
        body: JSON.stringify({
          question_text: currentQuestion,
          candidate_transcript: candidateAnswer,
          expected_topics: ["Linux", "AWS", "Kubernetes", "Troubleshooting", "Metrics"],
          difficulty: "INTERMEDIATE",
          duration_seconds: durationSeconds
        })
      });

      setEvalResult(res.data);
      setXpToast("+10 XP Earned!");
      setTimeout(() => setXpToast(null), 3000);
    } catch (e: any) {
      alert("Failed to evaluate answer: " + (e.message || "Error"));
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel-glow border border-indigo-500/20 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-2 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Quick Practice Sandbox
            </span>
            <span className="text-xs text-slate-400 font-mono">+10 XP Per Question</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Single Question Practice Chamber
          </h1>
          <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
            Target specific technologies with instant 5-pillar evaluation and progressive hint unlocks without starting a full assessment session.
          </p>
        </div>

        <div className="absolute right-0 bottom-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Topic Selection Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-white/10">
        {PRACTICE_TOPICS.map((topic) => (
          <button
            key={topic.id}
            onClick={() => handleSelectTopic(topic)}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
              selectedTopic.id === topic.id
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            {topic.name}
          </button>
        ))}
      </div>

      {/* Main Question Card */}
      <div className="p-8 rounded-3xl bg-slate-900/90 border border-white/10 flex flex-col gap-6 shadow-xl">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
              {selectedTopic.role}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={playAudio}
                className="p-2 rounded-xl bg-slate-950 border border-white/10 text-cyan-300 hover:bg-cyan-500/20 text-xs font-mono flex items-center gap-1.5 transition-colors"
                title="Listen to question"
              >
                <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-cyan-400 animate-pulse' : ''}`} />
                <span>Listen</span>
              </button>

              <button
                onClick={handleGenerateNextQuestion}
                disabled={isGenerating}
                className="px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 hover:border-cyan-500/40 text-xs text-slate-300 font-mono flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
                <span>New AI Question</span>
              </button>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
            "{currentQuestion}"
          </h2>
        </div>

        {/* Hint Trigger */}
        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <button
            onClick={() => setShowHints(!showHints)}
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>{showHints ? "Hide Hints" : "💡 Need a Clue? (3 Progressive Hints)"}</span>
          </button>

          {xpToast && (
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold animate-bounce flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {xpToast}
            </span>
          )}
        </div>

        {/* 3-Level Hint Drawer */}
        {showHints && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950/80 border border-amber-500/20 animate-fadeIn">
            {/* Clue 1 */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-amber-300">Level 1: Direction Clue</span>
                {hintLevelUnlocked >= 1 ? <Unlock className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-slate-500" />}
              </div>
              <p className="text-xs text-slate-300">
                {hintLevelUnlocked >= 1 ? "Identify whether this is an OS resource constraint, DNS/networking error, or code fault." : "Unlock to see where to start investigating."}
              </p>
              {hintLevelUnlocked < 1 && (
                <button onClick={() => setHintLevelUnlocked(1)} className="py-1 rounded bg-amber-500/10 text-amber-300 text-[10px] font-mono">Unlock 1</button>
              )}
            </div>

            {/* Clue 2 */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-cyan-300">Level 2: Commands & Logs</span>
                {hintLevelUnlocked >= 2 ? <Unlock className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-slate-500" />}
              </div>
              <p className="text-xs text-slate-300 font-mono">
                {hintLevelUnlocked >= 2 ? "Inspect logs with `--previous` flag and check system metrics (iostat, top, journalctl)." : "Requires Level 1 unlock."}
              </p>
              {hintLevelUnlocked === 1 && (
                <button onClick={() => setHintLevelUnlocked(2)} className="py-1 rounded bg-cyan-500/10 text-cyan-300 text-[10px] font-mono">Unlock 2</button>
              )}
            </div>

            {/* Clue 3 */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-indigo-300">Level 3: Full Architecture</span>
                {hintLevelUnlocked >= 3 ? <Unlock className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-slate-500" />}
              </div>
              <p className="text-xs text-slate-300">
                {hintLevelUnlocked >= 3 ? "Follow Problem Context -> Diagnostic Commands -> Solution Fix -> Long-term Prevention." : "Requires Level 2 unlock."}
              </p>
              {hintLevelUnlocked === 2 && (
                <button onClick={() => setHintLevelUnlocked(3)} className="py-1 rounded bg-indigo-500/10 text-indigo-300 text-[10px] font-mono">Unlock 3</button>
              )}
            </div>
          </div>
        )}

        {/* Answer Input Area */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <label>Type or paste your technical answer:</label>
            <span>Word count: {candidateAnswer.trim().split(/\s+/).filter(Boolean).length}</span>
          </div>

          <textarea
            rows={6}
            value={candidateAnswer}
            onChange={(e) => setCandidateAnswer(e.target.value)}
            placeholder="Type your explanation step-by-step (e.g. First I would run `kubectl describe pod` to inspect exit codes...)"
            className="w-full rounded-2xl bg-slate-950/80 border border-white/10 p-4 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500/50 resize-none leading-relaxed"
          />
        </div>

        {/* Submit Action */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setCandidateAnswer("")}
            className="text-xs text-slate-500 hover:text-slate-300 font-mono flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Answer</span>
          </button>

          <button
            onClick={handleSubmitAnswer}
            disabled={isEvaluating}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs font-mono flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Grading Answer with 5-Pillar Rubric...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Submit for AI Evaluation (+10 XP)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Evaluation Results Card */}
      {evalResult && (
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-indigo-500/30 flex flex-col gap-6 animate-fadeIn shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400">Assessment Breakdown</span>
              <h3 className="text-xl font-bold text-white">AI Rubric Evaluation Results</h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 text-right">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Overall Score</span>
                <span className={`text-3xl font-black font-mono ${evalResult.overall_score >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {evalResult.overall_score}%
                </span>
              </div>
            </div>
          </div>

          {/* 5 Pillar Sub-Scores */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: "Technical Accuracy (40%)", score: evalResult.technical_score, color: "text-cyan-400" },
              { label: "Concept Coverage (25%)", score: evalResult.concept_coverage_score, color: "text-indigo-400" },
              { label: "Reasoning Quality (20%)", score: evalResult.reasoning_score, color: "text-purple-400" },
              { label: "Practical Depth (10%)", score: evalResult.practical_score, color: "text-emerald-400" },
              { label: "Clarity (5%)", score: evalResult.communication_score, color: "text-amber-400" },
            ].map((p) => (
              <div key={p.label} className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-mono">{p.label}</span>
                <span className={`text-lg font-bold font-mono ${p.color}`}>{p.score}%</span>
              </div>
            ))}
          </div>

          {/* Strengths & Missing Concepts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex flex-col gap-2">
              <span className="text-xs font-bold text-emerald-300 font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Strengths Demonstrated:
              </span>
              <ul className="text-xs text-slate-300 flex flex-col gap-1 list-disc list-inside">
                {evalResult.strengths.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 flex flex-col gap-2">
              <span className="text-xs font-bold text-rose-300 font-mono flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> Missing Key Concepts:
              </span>
              <ul className="text-xs text-slate-300 flex flex-col gap-1 list-disc list-inside">
                {evalResult.missing_concepts.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Feedback & Recommendations */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 flex flex-col gap-2">
            <span className="text-xs font-mono font-bold text-cyan-300">Constructive Feedback:</span>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">{evalResult.feedback}</p>
          </div>
        </div>
      )}
    </div>
  );
}
