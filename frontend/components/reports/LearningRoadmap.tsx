"use client";

import { Calendar, BookOpen, Terminal, ExternalLink, CheckSquare } from "lucide-react";
import { WeeklyLearningMilestone } from "@/types";

interface LearningRoadmapProps {
  plan: WeeklyLearningMilestone[];
}

export function LearningRoadmap({ plan }: LearningRoadmapProps) {
  if (!plan || plan.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Personalized 30-Day Learning Roadmap</h3>
          <p className="text-xs text-slate-400 mt-0.5">Structured weekly syllabus targeting identified technical knowledge gaps.</p>
        </div>
        <span className="text-xs font-mono px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
          4-Week Accelerated Plan
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plan.map((weekItem) => (
          <div
            key={weekItem.week}
            className="p-5 rounded-2xl glass-panel border border-white/10 flex flex-col justify-between hover:border-indigo-500/30 transition-all"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">
                  Week {weekItem.week}
                </span>
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  7-Day Sprint
                </span>
              </div>

              <h4 className="text-sm font-semibold text-white mb-3">
                {weekItem.theme}
              </h4>

              {/* Objectives */}
              <div className="flex flex-col gap-1.5 mb-4">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Focus Objectives:</div>
                {weekItem.objectives.map((obj, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>

              {/* Hands-on Labs */}
              {weekItem.hands_on_labs && weekItem.hands_on_labs.length > 0 && (
                <div className="flex flex-col gap-1.5 mb-4 p-3 rounded-xl bg-slate-950/60 border border-white/5">
                  <div className="text-[11px] font-mono text-cyan-400 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Hands-On Lab Challenge:</span>
                  </div>
                  {weekItem.hands_on_labs.map((lab, idx) => (
                    <p key={idx} className="text-xs text-slate-300">
                      {lab}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Documentation Links */}
            {weekItem.documentation_links && weekItem.documentation_links.length > 0 && (
              <div className="pt-3 border-t border-white/5 flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  Official Docs:
                </span>
                {weekItem.documentation_links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 font-mono"
                  >
                    <span>Read Docs</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
