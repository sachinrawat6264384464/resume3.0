"use client";

import { useState, useEffect } from "react";
import { 
  Map, CheckCircle2, Circle, Trophy, ArrowRight, Loader2, Sparkles,
  ChevronDown, ChevronUp, Terminal, Cloud, Layers, ShieldAlert, Cpu,
  HardDrive, Server, Activity, Database, GitBranch, AlertTriangle, Code,
  FileCode, PlayCircle, Radio
} from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function RoadmapPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedWeek, setExpandedWeek] = useState<number>(1);
  const [completedLabs, setCompletedLabs] = useState<Record<number, boolean>>({ 1: true });

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const res = await apiFetch("/candidates/me/roadmap");
        if (res?.data) {
          setItems(res.data);
          const map: Record<number, boolean> = {};
          res.data.forEach((item: any) => {
            const num = item.week_number || parseInt(item.week?.replace("Week ", "") || "1");
            map[num] = !!item.done;
          });
          setCompletedLabs(map);
        }
      } catch (e) {
        console.warn("Roadmap fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmap();
  }, []);

  const toggleLabComplete = async (weekNum: number) => {
    const currentVal = !!completedLabs[weekNum];
    const targetVal = !currentVal;

    // Instant 2-way toggle optimistic state update
    setCompletedLabs(prev => ({ ...prev, [weekNum]: targetVal }));

    try {
      const res = await apiFetch(`/candidates/me/roadmap/${weekNum}/toggle`, { method: "POST" });
      if (res?.data && typeof res.data.done === "boolean") {
        setCompletedLabs(prev => ({ ...prev, [weekNum]: res.data.done }));
      }
    } catch (e) {
      console.warn("Failed to toggle roadmap week in DB:", e);
      setCompletedLabs(prev => ({ ...prev, [weekNum]: currentVal }));
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto flex flex-col gap-6 pb-16 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Header Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden flex flex-col justify-between gap-4 shadow-xl text-white">
        <div className="flex flex-col gap-2 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 dark:bg-blue-500/20 text-white border border-white/30 text-xs font-mono font-bold w-fit">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>🗓️ 30-DAY ADAPTIVE CURRICULUM</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            AI Career Roadmap & Hands-on Labs
          </h1>
          <p className="text-sm text-blue-100 dark:text-slate-300 max-w-2xl leading-relaxed font-medium">
            Personalized step-by-step module resolution based on your voice interview evaluations. Master Linux, AWS VPC, Kubernetes, Helm, CI/CD pipelines, and SRE Outage Simulations.
          </p>
        </div>

        {/* 4-Week High-Level Overview Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10 z-10">
          {[
            { week: "Week 1", title: "Linux & Shell", lab: "Server Monitoring Lab" },
            { week: "Week 2", title: "AWS Core + VPC", lab: "VPC Isolation Lab" },
            { week: "Week 3", title: "Kubernetes & Helm", lab: "Microservices K8s Lab" },
            { week: "Week 4", title: "CI/CD & SRE Outages", lab: "SRE Outage Sim Lab" },
          ].map((w, i) => (
            <button 
              key={i}
              onClick={() => setExpandedWeek(i + 1)}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                expandedWeek === i + 1
                  ? "bg-white text-slate-900 dark:bg-slate-800 dark:text-white border-amber-400 shadow-lg"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              }`}
            >
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-80">{w.week}</span>
              <span className="text-xs font-black truncate">{w.title}</span>
              <span className="text-[10px] opacity-75 truncate">{w.lab}</span>
            </button>
          ))}
        </div>
      </div>

      {/* CURRICULUM ACCORDION MODULES */}
      <div className="flex flex-col gap-5">
        
        {/* WEEK 1 MODULE */}
        <div className={`p-6 rounded-3xl border transition-all ${
          expandedWeek === 1 
            ? "bg-white dark:bg-slate-900 border-blue-500 shadow-xl" 
            : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
        }`}>
          <div 
            onClick={() => setExpandedWeek(expandedWeek === 1 ? 0 : 1)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                W1
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">Week 1</span>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200">
                    Server & Terminal Mastery
                  </span>
                </div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  🔥 Week 1 — Linux & Shell Deep Dive
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={(e) => { e.stopPropagation(); toggleLabComplete(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  completedLabs[1] 
                    ? "bg-emerald-600 text-white" 
                    : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{completedLabs[1] ? "Lab Completed" : "Mark Completed"}</span>
              </button>
              {expandedWeek === 1 ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </div>
          </div>

          {expandedWeek === 1 && (
            <div className="flex flex-col gap-6 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
              
              {/* Core Topics Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Linux Basics & Commands */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-blue-600" />
                    1. Linux Basics & Filesystem Hierarchy
                  </h3>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs flex flex-col gap-2 font-mono">
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-blue-600 dark:text-blue-400">/home</span> User home directories
                    </div>
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-blue-600 dark:text-blue-400">/etc</span> System configurations
                    </div>
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-blue-600 dark:text-blue-400">/var</span> Logs & variable data
                    </div>
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-blue-600 dark:text-blue-400">/tmp</span> Temporary runtime files
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2">Essential 25 Commands:</h4>
                  <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                    {[
                      "pwd", "ls", "cd", "mkdir", "touch", "cp", "mv", "rm", "cat", "less",
                      "head", "tail", "grep", "find", "locate", "chmod", "chown", "ps", "top",
                      "kill", "df", "du", "free", "ip", "curl", "wget", "ssh"
                    ].map((cmd, idx) => (
                      <span key={idx} className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-blue-600 dark:text-cyan-400">
                        {cmd}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Shell Scripting Snippet */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-emerald-600" />
                    2. Bash Shell Scripting & Automation
                  </h3>
                  <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto shadow-inner border border-slate-800">
                    <span className="text-slate-500">#!/bin/bash</span><br />
                    <span className="text-purple-400"># Server Log Inspection Loop</span><br />
                    <span className="text-blue-400">for</span> file <span className="text-blue-400">in</span> *.log<br />
                    <span className="text-blue-400">do</span><br />
                    &nbsp;&nbsp;<span className="text-amber-300">echo</span> <span className="text-emerald-300">"Processing log file: $file"</span><br />
                    &nbsp;&nbsp;<span className="text-amber-300">grep</span> <span className="text-emerald-300">"ERROR"</span> <span className="text-slate-300">$file</span> | <span className="text-amber-300">awk</span> <span className="text-emerald-300">{"'{print $1, $5}'"}</span><br />
                    <span className="text-blue-400">done</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs flex flex-col gap-1">
                    <span className="font-bold text-blue-900 dark:text-blue-300">🎯 Week 1 Hands-On Lab Assignment:</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      Build an automated server monitoring script that tracks <strong>CPU usage</strong>, <strong>RAM usage</strong>, <strong>Disk usage</strong>, <strong>Running processes</strong>, and <strong>Network status</strong>, generating alerts when thresholds cross 85%.
                    </span>
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>

        {/* WEEK 2 MODULE */}
        <div className={`p-6 rounded-3xl border transition-all ${
          expandedWeek === 2 
            ? "bg-white dark:bg-slate-900 border-blue-500 shadow-xl" 
            : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
        }`}>
          <div 
            onClick={() => setExpandedWeek(expandedWeek === 2 ? 0 : 2)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shadow-md">
                W2
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">Week 2</span>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200">
                    Production Cloud Infrastructure
                  </span>
                </div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  ☁️ Week 2 — AWS Core + VPC Topology
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={(e) => { e.stopPropagation(); toggleLabComplete(2); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  completedLabs[2] 
                    ? "bg-emerald-600 text-white" 
                    : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{completedLabs[2] ? "Lab Completed" : "Mark Completed"}</span>
              </button>
              {expandedWeek === 2 ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </div>
          </div>

          {expandedWeek === 2 && (
            <div className="flex flex-col gap-6 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* AWS Core Services */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-amber-500" />
                    1. Core AWS Services & IAM
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { name: "IAM", role: "Zero-trust roles & policies" },
                      { name: "EC2", role: "Elastic Compute Instances" },
                      { name: "S3", role: "Object storage & static hosting" },
                      { name: "RDS", role: "Managed Relational DBs" },
                      { name: "CloudWatch", role: "Telemetry & Alarm triggers" },
                      { name: "ALB / ELB", role: "Application Load Balancer" },
                    ].map((s, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col">
                        <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">{s.name}</span>
                        <span className="text-[10.5px] text-slate-500">{s.role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* VPC Architecture Diagram */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-500" />
                    2. Production VPC Networking Topology
                  </h3>
                  <div className="p-4 rounded-2xl bg-slate-900 text-amber-400 font-mono text-xs shadow-inner border border-slate-800 leading-relaxed">
                    VPC (10.0.0.0/16)<br />
                    &nbsp;│<br />
                    &nbsp;├── <span className="text-emerald-400">Public Subnet</span> (10.0.1.0/24)<br />
                    &nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── <span className="text-white">Application Load Balancer</span><br />
                    &nbsp;│<br />
                    &nbsp;└── <span className="text-rose-400">Private Subnet</span> (10.0.2.0/24)<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── <span className="text-white">EC2 Instances (App Tier)</span><br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── <span className="text-white">RDS PostgreSQL Database</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs flex flex-col gap-1">
                    <span className="font-bold text-amber-900 dark:text-amber-300">🎯 Week 2 Hands-On Lab Assignment:</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      Deploy <strong>Internet ➔ Load Balancer ➔ EC2 ➔ RDS</strong> architecture. Enforce security group rules so RDS database CANNOT be accessed directly from public internet.
                    </span>
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>

        {/* WEEK 3 MODULE */}
        <div className={`p-6 rounded-3xl border transition-all ${
          expandedWeek === 3 
            ? "bg-white dark:bg-slate-900 border-blue-500 shadow-xl" 
            : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
        }`}>
          <div 
            onClick={() => setExpandedWeek(expandedWeek === 3 ? 0 : 3)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                W3
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">Week 3</span>
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200">
                    Container Orchestration & Helm
                  </span>
                </div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  ☸️ Week 3 — Kubernetes Advanced + Helm Charts
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={(e) => { e.stopPropagation(); toggleLabComplete(3); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  completedLabs[3] 
                    ? "bg-emerald-600 text-white" 
                    : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{completedLabs[3] ? "Lab Completed" : "Mark Completed"}</span>
              </button>
              {expandedWeek === 3 ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </div>
          </div>

          {expandedWeek === 3 && (
            <div className="flex flex-col gap-6 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Concept Hierarchy */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-purple-600" />
                    1. Kubernetes Concept Hierarchy
                  </h3>
                  <div className="p-4 rounded-2xl bg-slate-900 text-purple-300 font-mono text-xs shadow-inner border border-slate-800 flex items-center justify-between">
                    <span>Container</span> ➔ <span>Docker</span> ➔ <span>Pod</span> ➔ <span>Deployment</span> ➔ <span>Service</span> ➔ <span>Ingress</span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">Core Topics:</h4>
                  <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                    {[
                      "Cluster", "Node", "Pod", "Deployment", "ReplicaSet", "Service",
                      "ConfigMap", "Secret", "Namespace", "Ingress", "PV/PVC", "StatefulSet",
                      "Liveness Probe", "Readiness Probe", "Requests/Limits", "HPA"
                    ].map((k, idx) => (
                      <span key={idx} className="px-2 py-1 rounded-md bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 font-bold text-purple-700 dark:text-purple-300">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Helm Templating */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-purple-600" />
                    2. Helm Package Manager Structure
                  </h3>
                  <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs shadow-inner border border-slate-800 leading-relaxed">
                    my-app-chart/<br />
                    ├── <span className="text-amber-400">Chart.yaml</span> (Metadata)<br />
                    ├── <span className="text-emerald-400">values.yaml</span> (Config variables)<br />
                    └── <span className="text-cyan-400">templates/</span><br />
                    &nbsp;&nbsp;&nbsp;&nbsp;├── deployment.yaml<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;└── service.yaml
                  </div>

                  <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs flex flex-col gap-1">
                    <span className="font-bold text-purple-900 dark:text-purple-300">🎯 Week 3 Hands-On Lab Assignment:</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      Deploy <strong>Frontend ➔ Backend API ➔ Database</strong> to Kubernetes with HPA (Horizontal Pod Autoscaler), Liveness & Readiness probes, and Helm chart upgrades.
                    </span>
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>

        {/* WEEK 4 MODULE & SRE OUTAGE SIMULATIONS */}
        <div className={`p-6 rounded-3xl border transition-all ${
          expandedWeek === 4 
            ? "bg-white dark:bg-slate-900 border-blue-500 shadow-xl" 
            : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
        }`}>
          <div 
            onClick={() => setExpandedWeek(expandedWeek === 4 ? 0 : 4)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                W4
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400">Week 4</span>
                  <span className="text-[11px] font-bold text-red-700 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-md border border-red-200">
                    Automated Deployment & Reliability
                  </span>
                </div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  🚀 Week 4 — CI/CD + SRE + Outage Simulations
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={(e) => { e.stopPropagation(); toggleLabComplete(4); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  completedLabs[4] 
                    ? "bg-emerald-600 text-white" 
                    : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{completedLabs[4] ? "Lab Completed" : "Mark Completed"}</span>
              </button>
              {expandedWeek === 4 ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </div>
          </div>

          {expandedWeek === 4 && (
            <div className="flex flex-col gap-6 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
              
              {/* CI/CD & Observability */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-red-600" />
                    1. CI/CD Pipeline Architecture
                  </h3>
                  <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs shadow-inner border border-slate-800 leading-relaxed">
                    Developer ➔ Git Push ➔ CI Pipeline ➔ Automated Tests ➔ Build Docker ➔ Push ECR ➔ Deploy K8s
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-red-600" />
                    2. Three Pillars of Observability
                  </h3>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                      <span className="font-bold text-red-600 block">Logs</span>
                      <span className="text-[10px] text-slate-500">Errors & Auth</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                      <span className="font-bold text-amber-600 block">Metrics</span>
                      <span className="text-[10px] text-slate-500">CPU & Latency</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                      <span className="font-bold text-emerald-600 block">Traces</span>
                      <span className="text-[10px] text-slate-500">Distributed spans</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* 🚨 4 SRE OUTAGE LAB SIMULATIONS */}
              <div className="flex flex-col gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-red-600 font-black text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>🚨 SRE Production Outage Simulation Labs (4 Key Incidents)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  
                  {/* Incident 1 */}
                  <div className="p-4 rounded-2xl bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 flex flex-col gap-1.5">
                    <span className="font-bold text-red-700 dark:text-red-400 flex items-center justify-between">
                      <span>Incident 1 — High CPU Outage</span>
                      <span className="font-mono text-[10px] bg-red-200 dark:bg-red-900/60 px-2 py-0.5 rounded">CPU 100%</span>
                    </span>
                    <p className="text-slate-700 dark:text-slate-300">
                      API ➔ CPU 100% ➔ Latency Spike ➔ Requests fail.<br />
                      <strong>Action Plan:</strong> Detect ➔ Investigate top processes ➔ Scale replicas HPA ➔ Recover.
                    </p>
                  </div>

                  {/* Incident 2 */}
                  <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex flex-col gap-1.5">
                    <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center justify-between">
                      <span>Incident 2 — Database Down</span>
                      <span className="font-mono text-[10px] bg-amber-200 dark:bg-amber-900/60 px-2 py-0.5 rounded">5xx Errors</span>
                    </span>
                    <p className="text-slate-700 dark:text-slate-300">
                      Backend ➔ Database ❌ ➔ 5xx Server Errors.<br />
                      <strong>Action Plan:</strong> Inspect application logs ➔ Failover to Multi-AZ standby ➔ Restore connection pool.
                    </p>
                  </div>

                  {/* Incident 3 */}
                  <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 flex flex-col gap-1.5">
                    <span className="font-bold text-blue-700 dark:text-blue-400 flex items-center justify-between">
                      <span>Incident 3 — Bad Deployment</span>
                      <span className="font-mono text-[10px] bg-blue-200 dark:bg-blue-900/60 px-2 py-0.5 rounded">Rollback</span>
                    </span>
                    <p className="text-slate-700 dark:text-slate-300">
                      Version 1 working ➔ Version 2 deployed ❌ ➔ Errors spike.<br />
                      <strong>Action Plan:</strong> Execute <code>helm rollback</code> or <code>kubectl rollout undo</code> to instantly restore V1.
                    </p>
                  </div>

                  {/* Incident 4 */}
                  <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 flex flex-col gap-1.5">
                    <span className="font-bold text-purple-700 dark:text-purple-400 flex items-center justify-between">
                      <span>Incident 4 — Memory Leak (Pod OOM)</span>
                      <span className="font-mono text-[10px] bg-purple-200 dark:bg-purple-900/60 px-2 py-0.5 rounded">OOMKilled</span>
                    </span>
                    <p className="text-slate-700 dark:text-slate-300">
                      Memory ↑ ➔ Pod OOM ➔ CrashLoop ➔ Restart.<br />
                      <strong>Action Plan:</strong> Analyze heap dumps ➔ Increase RAM requests/limits ➔ Fix leak in code.
                    </p>
                  </div>

                </div>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
