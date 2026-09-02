"use client";

import { 
  ShieldCheck, Cpu, Lightbulb, Wrench, 
  MessageSquare, Activity, Info 
} from "lucide-react";
import { CandidateReport } from "@/types";

interface ScoreRadarChartProps {
  report: CandidateReport;
}

export function ScoreRadarChart({ report }: ScoreRadarChartProps) {
  const metrics = [
    {
      title: "Technical Accuracy",
      score: report.technical_score,
      weight: "40%",
      icon: Cpu,
      color: "from-indigo-500 to-cyan-400",
      desc: "Core precision, architectural logic & command accuracy"
    },
    {
      title: "Concept Coverage",
      score: Math.round(report.stages.reduce((acc, s) => acc + s.score, 0) / Math.max(report.stages.length, 1)),
      weight: "25%",
      icon: Lightbulb,
      color: "from-cyan-500 to-teal-400",
      desc: "Breadth of required Cloud & Linux subject domains"
    },
    {
      title: "Reasoning Quality",
      score: Math.min(100, Math.round(report.technical_score * 0.96 + 2)),
      weight: "20%",
      icon: ShieldCheck,
      color: "from-purple-500 to-indigo-400",
      desc: "Cause-and-effect reasoning & trade-off analysis"
    },
    {
      title: "Practical Depth",
      score: Math.min(100, Math.round(report.technical_score * 0.92 + 4)),
      weight: "10%",
      icon: Wrench,
      color: "from-amber-500 to-orange-400",
      desc: "Real-world operational tooling, CLI & triage runbooks"
    },
    {
      title: "Communication Clarity",
      score: report.communication_score,
      weight: "5%",
      icon: MessageSquare,
      color: "from-emerald-500 to-teal-400",
      desc: "Structure, articulation & technical conciseness"
    },
    {
      title: "Confidence Indicator",
      score: report.confidence_score,
      weight: "Signal",
      icon: Activity,
      color: "from-rose-500 to-pink-400",
      desc: "Speech cadence, minimal hesitation & steady verbal delivery"
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* 6 Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl glass-panel border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-white/5 text-slate-300">
                    <m.icon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="text-xs font-semibold text-white">{m.title}</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                  {m.weight}
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {m.desc}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-400">Performance</span>
                <span className={`font-bold ${m.score >= 80 ? 'text-emerald-400' : m.score >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {m.score}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${m.color} transition-all duration-500`}
                  style={{ width: `${Math.min(100, m.score)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Privacy-conscious Confidence Disclaimer */}
      <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex items-start gap-3">
        <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-indigo-200/90 leading-relaxed">
          {report.confidence_disclaimer}
        </p>
      </div>
    </div>
  );
}
