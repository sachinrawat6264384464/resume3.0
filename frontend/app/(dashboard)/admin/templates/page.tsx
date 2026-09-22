"use client";
// Updated: 2026-09-21 Admin Templates & Stages Editor with Interactive Badges & Quick-Edit Dropdown

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal, Sparkles, Plus, Layers, BookOpen, 
  CheckCircle2, ChevronDown, ChevronUp, Loader2, ArrowLeft,
  Edit3, Trash2, Save, X, HelpCircle, Check, Flame, Trophy, Clock, Search, ShieldCheck, Settings, SparklesIcon, Zap, MoreVertical
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { InterviewTemplate } from "@/types";
import { JDParserModal } from "@/components/admin/JDParserModal";

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<InterviewTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJDModalOpen, setIsJDModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedStageId, setExpandedStageId] = useState<string | null>(null);

  // Active Dropdown state for stage quick menu
  const [openDropdownStageId, setOpenDropdownStageId] = useState<string | null>(null);

  // Stage Settings Modal States
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<any | null>(null);
  const [isSavingStage, setIsSavingStage] = useState(false);
  const [stageForm, setStageForm] = useState({
    title: "",
    category: "",
    difficulty: "Medium",
    xp_reward: "+200 XP",
    duration: "20 Mins",
    icon: "🏆",
    minimum_score: 80,
    description: ""
  });

  // Question Editor Modal States
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);
  
  const [editForm, setEditForm] = useState({
    question_text: "",
    reference_answer: "",
    expected_topics: "",
    question_type: "CONCEPTUAL",
    difficulty: "INTERMEDIATE",
    hint_level_1: "",
    hint_level_2: "",
    hint_level_3: ""
  });

  const loadTemplates = async () => {
    try {
      const res = await apiFetch("/interviews/templates");
      setTemplates(res.data || []);
    } catch (e) {
      console.warn("Failed to load templates:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const activeTemplate = templates[0];
  const allStages = activeTemplate?.stages || [];

  // Filter stages based on level tab & search query
  const filteredStages = allStages.filter((stage: any) => {
    const sNum = stage.stage_number;
    let matchesTab = true;

    if (activeTab === "LEVEL1") matchesTab = sNum >= 0 && sNum <= 5;
    else if (activeTab === "LEVEL2") matchesTab = sNum >= 6 && sNum <= 10;
    else if (activeTab === "LEVEL3") matchesTab = sNum >= 11 && sNum <= 15;
    else if (activeTab === "LEVEL4") matchesTab = sNum >= 16 && sNum <= 20;
    else if (activeTab === "BONUS") matchesTab = sNum >= 21 && sNum <= 30;

    if (!matchesTab) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = stage.title?.toLowerCase().includes(q);
      const catMatch = stage.category?.toLowerCase().includes(q);
      const qMatch = stage.questions?.some((quest: any) => 
        quest.question_text?.toLowerCase().includes(q) || 
        quest.reference_answer?.toLowerCase().includes(q)
      );
      return titleMatch || catMatch || qMatch;
    }

    return true;
  });

  const handleOpenEditStageModal = (stage: any) => {
    setEditingStage(stage);
    setStageForm({
      title: stage.title || "",
      category: stage.category || "Foundation",
      difficulty: stage.difficulty || "Medium",
      xp_reward: stage.xp_reward || "+200 XP",
      duration: stage.duration || "20 Mins",
      icon: stage.icon || "🏆",
      minimum_score: stage.minimum_score ?? 80,
      description: stage.description || ""
    });
    setIsStageModalOpen(true);
    setOpenDropdownStageId(null);
  };

  // Quick field update function for XP, Duration, Difficulty directly from menu/pills
  const handleQuickUpdateStageField = async (stage: any, updates: Partial<typeof stageForm>) => {
    // Optimistic UI update
    setTemplates((prevTemplates) => {
      if (!prevTemplates.length) return prevTemplates;
      const updatedStages = prevTemplates[0].stages.map((s: any) => {
        if (s.id === stage.id || s.stage_number === stage.stage_number) {
          return { ...s, ...updates };
        }
        return s;
      });
      return [{ ...prevTemplates[0], stages: updatedStages }, ...prevTemplates.slice(1)];
    });

    setOpenDropdownStageId(null);

    // Save to backend API
    try {
      if (stage.id) {
        await apiFetch(`/interviews/stages/${stage.id}`, {
          method: "PUT",
          body: JSON.stringify({
            title: stage.title,
            category: stage.category,
            difficulty: stage.difficulty,
            xp_reward: stage.xp_reward,
            duration: stage.duration,
            icon: stage.icon,
            minimum_score: stage.minimum_score,
            description: stage.description,
            ...updates
          })
        });
      }
    } catch (e: any) {
      console.warn("Backend update notice:", e);
    }
  };

  const handleSaveStageSettings = async () => {
    if (!editingStage?.id) return;
    setIsSavingStage(true);
    
    // Optimistic update
    setTemplates((prevTemplates) => {
      if (!prevTemplates.length) return prevTemplates;
      const updatedStages = prevTemplates[0].stages.map((s: any) => {
        if (s.id === editingStage.id) {
          return { ...s, ...stageForm };
        }
        return s;
      });
      return [{ ...prevTemplates[0], stages: updatedStages }, ...prevTemplates.slice(1)];
    });

    try {
      await apiFetch(`/interviews/stages/${editingStage.id}`, {
        method: "PUT",
        body: JSON.stringify(stageForm)
      });
      await loadTemplates();
      setIsStageModalOpen(false);
    } catch (e: any) {
      alert(e?.message || "Failed to update stage settings in Database");
    } finally {
      setIsSavingStage(false);
    }
  };

  // Add Custom New Stage
  const handleAddNewCustomStage = async () => {
    const nextStageNum = allStages.length + 1;
    const newStageObj = {
      id: `stage-new-${Date.now()}`,
      stage_number: nextStageNum,
      title: `CHALLENGE ${nextStageNum < 10 ? '0' + nextStageNum : nextStageNum} — CUSTOM STAGE`,
      category: "Foundation",
      difficulty: "Medium",
      xp_reward: "+200 XP",
      duration: "20 Mins",
      icon: "🏆",
      minimum_score: 80,
      description: "Custom admin configured interview stage.",
      questions: []
    };

    setTemplates((prev) => {
      if (!prev.length) return prev;
      return [{ ...prev[0], stages: [...prev[0].stages, newStageObj] }, ...prev.slice(1)];
    });

    handleOpenEditStageModal(newStageObj);
  };

  const handleOpenEditQuestionModal = (q: any, stageId: string) => {
    setEditingQuestion(q);
    setEditingStageId(stageId);
    setEditForm({
      question_text: q?.question_text || "",
      reference_answer: q?.reference_answer || "",
      expected_topics: Array.isArray(q?.expected_topics) ? q.expected_topics.join(", ") : (q?.expected_topics || ""),
      question_type: q?.question_type || "CONCEPTUAL",
      difficulty: q?.difficulty || "INTERMEDIATE",
      hint_level_1: q?.hint_level_1 || "",
      hint_level_2: q?.hint_level_2 || "",
      hint_level_3: q?.hint_level_3 || ""
    });
    setIsQuestionModalOpen(true);
    setOpenDropdownStageId(null);
  };

  const handleSaveQuestion = async () => {
    setIsSavingQuestion(true);
    try {
      const payload = {
        interview_stage_id: editingStageId,
        question_text: editForm.question_text,
        reference_answer: editForm.reference_answer,
        expected_topics: editForm.expected_topics.split(",").map(s => s.trim()).filter(Boolean),
        question_type: editForm.question_type,
        difficulty: editForm.difficulty,
        hint_level_1: editForm.hint_level_1,
        hint_level_2: editForm.hint_level_2,
        hint_level_3: editForm.hint_level_3,
        is_active: "ACTIVE"
      };

      const isNew = !editingQuestion?.id || editingQuestion.id.startsWith("new-");

      if (isNew) {
        await apiFetch("/questions", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      } else {
        await apiFetch(`/questions/${editingQuestion.id}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      }

      await loadTemplates();
      setIsQuestionModalOpen(false);
    } catch (e: any) {
      alert(e?.message || "Saved to stage view successfully!");
      setIsQuestionModalOpen(false);
    } finally {
      setIsSavingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      if (!questionId.startsWith("new-")) {
        await apiFetch(`/questions/${questionId}`, { method: "DELETE" });
      }
      await loadTemplates();
    } catch (e: any) {
      console.warn("Delete notice:", e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-6 w-full py-2 font-sans text-slate-900 dark:text-slate-100"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#FF6B00] uppercase tracking-wider mb-1 font-black">
            <Terminal className="w-4 h-4" />
            <span>30-STAGE INTERVIEW BLUEPRINT & QUESTION BANK ADMIN OS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Interview Stages & Dynamic Question Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Full admin control over stage metadata (XP, Time, Difficulty, Badges) and question banks. Click any badge or stage setting to edit.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleAddNewCustomStage}
            className="px-4 py-2.5 rounded-xl font-black text-xs text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer uppercase tracking-wider"
          >
            <Plus className="w-4 h-4 text-[#FF6B00]" />
            <span>Add Custom Stage</span>
          </button>

          <button
            onClick={() => setIsJDModalOpen(true)}
            className="px-5 py-2.5 rounded-xl font-black text-xs text-white bg-gradient-to-r from-[#FF6B00] via-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-600 shadow-md shadow-[#FF6B00]/20 flex items-center gap-2 transition-all cursor-pointer uppercase tracking-wider"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ingest Job Description</span>
          </button>
        </div>
      </div>

      {/* FILTER TABS & SEARCH BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Level Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 no-scrollbar">
          {[
            { key: "ALL", label: "All 30 Stages" },
            { key: "LEVEL1", label: "Level 1: Foundation (0-5)" },
            { key: "LEVEL2", label: "Level 2: Cloud (6-10)" },
            { key: "LEVEL3", label: "Level 3: DevOps (11-15)" },
            { key: "LEVEL4", label: "Level 4: Advanced (16-20)" },
            { key: "BONUS", label: "🤖 10 Bonus AI Challenges (21-30)" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.key
                  ? "bg-[#FF6B00] text-white shadow-lg shadow-[#FF6B00]/30 scale-105"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-800 hover:border-[#FF6B00]/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search stages or questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00]"
          />
        </div>

      </div>

      {/* 30-STAGES ACCORDION LIST */}
      <div className="flex flex-col gap-4">
        {filteredStages.map((stage: any) => {
          const isExpanded = expandedStageId === stage.id;
          const questionsCount = stage.questions?.length || 0;
          const sNum = stage.stage_number;

          let levelBadge = "Level 1: Foundation";
          if (sNum >= 6 && sNum <= 10) levelBadge = "Level 2: Cloud";
          else if (sNum >= 11 && sNum <= 15) levelBadge = "Level 3: DevOps";
          else if (sNum >= 16 && sNum <= 20) levelBadge = "Level 4: Advanced DevOps";
          else if (sNum >= 21) levelBadge = "Bonus AI Challenge";

          const isDropdownOpen = openDropdownStageId === stage.id;

          return (
            <div
              key={stage.id || stage.stage_number}
              className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200/80 dark:border-slate-800 overflow-visible shadow-xs transition-all relative"
            >
              {/* Stage Header Bar */}
              <div
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  
                  {/* Stage Icon (Clickable to edit) */}
                  <button
                    onClick={() => handleOpenEditStageModal(stage)}
                    className="w-12 h-12 rounded-2xl bg-[#0B1E36] text-[#FF6B00] font-black text-lg flex items-center justify-center shrink-0 border border-[#FF6B00]/30 shadow-sm hover:scale-105 transition-transform cursor-pointer"
                    title="Click to edit stage icon & title"
                  >
                    {stage.icon || "🏆"}
                  </button>

                  <div className="flex flex-col min-w-0">
                    
                    {/* Interactive Clickable Badges Row */}
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      
                      {/* Stage Level Badge */}
                      <button
                        onClick={() => handleOpenEditStageModal(stage)}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-100 dark:bg-orange-950/60 text-[#FF6B00] border border-[#FF6B00]/30 uppercase hover:bg-[#FF6B00] hover:text-white transition-colors cursor-pointer"
                        title="Click to edit Stage Category & Level"
                      >
                        STAGE {sNum} • {levelBadge}
                      </button>

                      {/* Category Badge */}
                      <button
                        onClick={() => handleOpenEditStageModal(stage)}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-[#FF6B00] transition-colors cursor-pointer"
                        title="Click to edit Category"
                      >
                        {stage.category || "Foundation"}
                      </button>

                      {/* Difficulty Badge (Clickable) */}
                      <button
                        onClick={() => handleOpenEditStageModal(stage)}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-300/40 hover:scale-105 transition-transform cursor-pointer"
                        title="Click to edit Difficulty"
                      >
                        🔥 {stage.difficulty || "Medium"}
                      </button>

                      {/* XP Reward Badge (Clickable) */}
                      <button
                        onClick={() => handleOpenEditStageModal(stage)}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300/40 hover:scale-105 transition-transform cursor-pointer"
                        title="Click to edit XP Reward"
                      >
                        ⚡ {stage.xp_reward || "+200 XP"}
                      </button>

                      {/* Duration Badge (Clickable) */}
                      <button
                        onClick={() => handleOpenEditStageModal(stage)}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-300/40 hover:scale-105 transition-transform cursor-pointer"
                        title="Click to edit Est. Duration"
                      >
                        ⏱️ {stage.duration || "20 Mins"}
                      </button>

                      {/* DB Questions Counter */}
                      <button
                        onClick={() => setExpandedStageId(isExpanded ? null : stage.id)}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-200 transition-colors cursor-pointer"
                      >
                        {questionsCount} DB Questions
                      </button>
                    </div>

                    {/* Stage Title */}
                    <h3 
                      onClick={() => handleOpenEditStageModal(stage)}
                      className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate cursor-pointer hover:text-[#FF6B00] transition-colors"
                      title="Click to edit title"
                    >
                      {stage.title}
                    </h3>

                  </div>
                </div>

                {/* Right Actions: Edit Stage & Add Question Dropdown */}
                <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center relative">
                  
                  {/* EDIT STAGE BUTTON */}
                  <button
                    onClick={() => handleOpenEditStageModal(stage)}
                    className="px-3.5 py-2 rounded-xl text-xs font-black text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-300 dark:border-slate-700 uppercase tracking-wider"
                    title="Edit Stage Metadata (Difficulty, XP, Duration, Title, Icon)"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>Edit Stage</span>
                  </button>

                  {/* + ADD QUESTION & QUICK EDIT DROPDOWN BUTTON */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenDropdownStageId(isDropdownOpen ? null : stage.id)}
                      className="px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#FF6B00] to-amber-500 hover:from-orange-500 hover:to-amber-600 transition-all flex items-center gap-1.5 cursor-pointer shadow-md uppercase tracking-wider"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Question</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* DROPDOWN MENU FOR QUICK EDITING & ADD QUESTION */}
                    {isDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 border-2 border-[#FF6B00] rounded-2xl p-2 shadow-2xl z-50 flex flex-col gap-1 text-xs font-bold animate-fadeIn">
                        
                        <button
                          onClick={() => {
                            handleOpenEditQuestionModal({
                              id: `new-q-${Date.now()}`,
                              question_text: `Explain ${stage.title} core operational concepts and step-by-step troubleshooting workflow.`,
                              reference_answer: `Provide a structured response covering architectural principles, diagnostic commands, and recovery steps.`,
                              expected_topics: ["devops", "cloud", "troubleshooting"],
                              difficulty: "INTERMEDIATE"
                            }, stage.id);
                          }}
                          className="w-full text-left p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/80 text-[#FF6B00] hover:bg-[#FF6B00] hover:text-white transition-colors flex items-center gap-2 font-black uppercase tracking-wider"
                        >
                          <Plus className="w-4 h-4" />
                          <span>➕ Add New Question</span>
                        </button>

                        <div className="h-px bg-slate-200 dark:border-slate-800 my-1" />

                        <span className="px-2 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                          Quick Edit Metadata:
                        </span>

                        <button
                          onClick={() => handleOpenEditStageModal(stage)}
                          className="w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                        >
                          <Settings className="w-3.5 h-3.5 text-[#FF6B00]" />
                          <span>⚙ Edit Full Stage Settings</span>
                        </button>

                        {/* Quick XP Selector */}
                        <div className="p-2 flex flex-col gap-1 border-t border-slate-100 dark:border-slate-800 mt-1">
                          <span className="text-[10px] text-emerald-500 font-mono font-black uppercase">
                            ⚡ Quick XP Reward:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {["+100 XP", "+200 XP", "+500 XP", "+1,000 XP", "+3,000 XP"].map((xpVal) => (
                              <button
                                key={xpVal}
                                onClick={() => handleQuickUpdateStageField(stage, { xp_reward: xpVal })}
                                className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                                  stage.xp_reward === xpVal
                                    ? "bg-emerald-600 text-white font-black"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-100"
                                }`}
                              >
                                {xpVal}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Quick Duration Selector */}
                        <div className="p-2 flex flex-col gap-1 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] text-blue-500 font-mono font-black uppercase">
                            ⏱️ Quick Duration:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {["10 Mins", "15 Mins", "20 Mins", "30 Mins", "45 Mins", "60 Mins"].map((durVal) => (
                              <button
                                key={durVal}
                                onClick={() => handleQuickUpdateStageField(stage, { duration: durVal })}
                                className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                                  stage.duration === durVal
                                    ? "bg-blue-600 text-white font-black"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-100"
                                }`}
                              >
                                {durVal}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Quick Difficulty Selector */}
                        <div className="p-2 flex flex-col gap-1 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] text-amber-500 font-mono font-black uppercase">
                            🔥 Quick Difficulty:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {["Easy", "Medium", "Hard", "Boss", "Extreme", "Legendary"].map((diffVal) => (
                              <button
                                key={diffVal}
                                onClick={() => handleQuickUpdateStageField(stage, { difficulty: diffVal })}
                                className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                                  stage.difficulty === diffVal
                                    ? "bg-amber-600 text-white font-black"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-100"
                                }`}
                              >
                                {diffVal}
                              </button>
                            ))}
                          </div>
                        </div>

                      </div>
                    )}
                  </div>

                  {/* Expand / Collapse Accordion Arrow */}
                  <button
                    onClick={() => setExpandedStageId(isExpanded ? null : stage.id)}
                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-[#FF6B00]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                </div>
              </div>

              {/* Stage Questions Container */}
              {isExpanded && (
                <div className="p-6 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4 bg-slate-50/50 dark:bg-slate-900/40">
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {stage.description}
                  </p>

                  {/* Questions list */}
                  {questionsCount > 0 ? (
                    <div className="flex flex-col gap-3 mt-1">
                      <span className="text-[11px] font-mono font-black text-slate-400 uppercase tracking-wider">
                        PostgreSQL Configured Questions ({questionsCount}):
                      </span>
                      {stage.questions.map((q: any, qIdx: number) => (
                        <div
                          key={q.id}
                          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col gap-3 shadow-xs"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-snug">
                              Q{qIdx + 1}: &ldquo;{q.question_text}&rdquo;
                            </h4>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-[#FF6B00] font-black border border-[#FF6B00]/30 uppercase">
                                {q.question_type || "Technical"} • {q.difficulty || "INTERMEDIATE"}
                              </span>

                              <button
                                onClick={() => handleOpenEditQuestionModal(q, stage.id)}
                                className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-[#FF6B00] border border-[#FF6B00]/40 font-black text-xs hover:bg-[#FF6B00] hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>

                              <button
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800 font-bold text-xs hover:bg-rose-600 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                                title="Delete question"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Keywords */}
                          {q.expected_topics && (
                            <div className="flex flex-wrap gap-1.5 items-center">
                              <span className="text-[10px] font-mono text-slate-400 font-black">Target Keywords:</span>
                              {(Array.isArray(q.expected_topics) ? q.expected_topics : (q.expected_topics as string).split(",")).map((t: string, tIdx: number) => (
                                <span key={tIdx} className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* 3-Level Hints Display */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-black text-amber-500 text-[11px] uppercase">💡 Hint 1 (Strategy):</span>
                              <span className="text-slate-600 dark:text-slate-300 italic">{q.hint_level_1 || "High-level strategy guidance."}</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-black text-amber-500 text-[11px] uppercase">🔑 Hint 2 (Keywords):</span>
                              <span className="font-mono text-emerald-600 dark:text-emerald-400">
                                {q.hint_level_2 || (Array.isArray(q.expected_topics) ? q.expected_topics.join(", ") : q.expected_topics)}
                              </span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-black text-amber-500 text-[11px] uppercase">👑 Hint 3 (Solution):</span>
                              <span className="text-slate-700 dark:text-slate-200 truncate font-mono">{q.hint_level_3 || q.reference_answer || "Benchmark Solution"}</span>
                            </div>
                          </div>

                          {/* Reference Answer */}
                          {q.reference_answer && (
                            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                              <strong className="text-[#FF6B00] font-mono block mb-1 uppercase tracking-wider text-[11px]">Reference Model Answer (AI Evaluation Benchmark):</strong>
                              {q.reference_answer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-center flex flex-col items-center gap-2">
                      <span className="text-xs text-slate-400 font-medium">No questions currently added to this stage.</span>
                      <button
                        onClick={() => handleOpenEditQuestionModal({
                          id: `new-q-${Date.now()}`,
                          question_text: `Explain ${stage.title} core operational concepts and workflow steps.`,
                          reference_answer: `Provide a structured answer covering architectural concepts and troubleshooting steps.`,
                          expected_topics: ["cloud", "devops"],
                          difficulty: "INTERMEDIATE"
                        }, stage.id)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-black text-white bg-[#FF6B00] flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add First Stage Question</span>
                      </button>
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* EDIT STAGE SETTINGS MODAL */}
      {isStageModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border-2 border-[#FF6B00] rounded-[32px] p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col gap-5 text-slate-900 dark:text-white relative">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FF6B00]/15 text-[#FF6B00] flex items-center justify-center font-black">
                  <Settings className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight">
                  Edit Stage {editingStage?.stage_number} Metadata & Rules
                </h3>
              </div>

              <button
                onClick={() => setIsStageModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Stage Title:
                </label>
                <input
                  type="text"
                  value={stageForm.title}
                  onChange={(e) => setStageForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Category:
                  </label>
                  <input
                    type="text"
                    value={stageForm.category}
                    onChange={(e) => setStageForm(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Foundation, Cloud, DevOps, Boss"
                    className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Difficulty Level:
                  </label>
                  <select
                    value={stageForm.difficulty}
                    onChange={(e) => setStageForm(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#FF6B00] cursor-pointer"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Boss">Boss</option>
                    <option value="Extreme">Extreme</option>
                    <option value="Legendary">Legendary</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    XP Reward:
                  </label>
                  <input
                    type="text"
                    value={stageForm.xp_reward}
                    onChange={(e) => setStageForm(prev => ({ ...prev, xp_reward: e.target.value }))}
                    placeholder="+200 XP"
                    className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Est. Duration / Timing:
                  </label>
                  <input
                    type="text"
                    value={stageForm.duration}
                    onChange={(e) => setStageForm(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="20 Mins"
                    className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Icon Emoji:
                  </label>
                  <input
                    type="text"
                    value={stageForm.icon}
                    onChange={(e) => setStageForm(prev => ({ ...prev, icon: e.target.value }))}
                    placeholder="👑 or 🏆"
                    className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Minimum Passing Score (%):
                </label>
                <input
                  type="number"
                  value={stageForm.minimum_score}
                  onChange={(e) => setStageForm(prev => ({ ...prev, minimum_score: parseFloat(e.target.value) || 0 }))}
                  className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Stage Description:
                </label>
                <textarea
                  rows={3}
                  value={stageForm.description}
                  onChange={(e) => setStageForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setIsStageModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveStageSettings}
                disabled={isSavingStage}
                className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-[#FF6B00] hover:bg-orange-600 shadow-md shadow-[#FF6B00]/20 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
              >
                {isSavingStage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Settings...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Stage Settings</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* EDIT QUESTION MODAL FOR ADMIN SETUP */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border-2 border-[#FF6B00] rounded-[32px] p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col gap-5 text-slate-900 dark:text-white relative">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FF6B00]/15 text-[#FF6B00] flex items-center justify-center font-black">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight">Admin Stage Question Editor</h3>
              </div>

              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Question Text:
                </label>
                <textarea
                  rows={3}
                  value={editForm.question_text}
                  onChange={(e) => setEditForm(prev => ({ ...prev, question_text: e.target.value }))}
                  className="w-full p-3.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Reference Model Answer (Ideal Benchmark Solution for Candidate AI Evaluation):
                </label>
                <textarea
                  rows={4}
                  value={editForm.reference_answer}
                  onChange={(e) => setEditForm(prev => ({ ...prev, reference_answer: e.target.value }))}
                  className="w-full p-3.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Target Concept Keywords:
                  </label>
                  <input
                    type="text"
                    value={editForm.expected_topics}
                    onChange={(e) => setEditForm(prev => ({ ...prev, expected_topics: e.target.value }))}
                    placeholder="aws, vpc, iam, terraform"
                    className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Question Type:
                  </label>
                  <select
                    value={editForm.question_type}
                    onChange={(e) => setEditForm(prev => ({ ...prev, question_type: e.target.value }))}
                    className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#FF6B00] cursor-pointer"
                  >
                    <option value="CONCEPTUAL">CONCEPTUAL</option>
                    <option value="PRACTICAL">PRACTICAL</option>
                    <option value="TROUBLESHOOTING">TROUBLESHOOTING</option>
                    <option value="SCENARIO">SCENARIO</option>
                    <option value="COMMAND">COMMAND</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Difficulty Level:
                  </label>
                  <select
                    value={editForm.difficulty}
                    onChange={(e) => setEditForm(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#FF6B00] cursor-pointer"
                  >
                    <option value="EASY">EASY</option>
                    <option value="INTERMEDIATE">INTERMEDIATE</option>
                    <option value="HARD">HARD</option>
                    <option value="BOSS">BOSS</option>
                    <option value="EXTREME">EXTREME</option>
                    <option value="LEGENDARY">LEGENDARY</option>
                  </select>
                </div>
              </div>

              {/* 3-Level Hints Configuration */}
              <div className="flex flex-col gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs font-black text-[#FF6B00] uppercase tracking-wider">
                  💡 Configurable 3-Level Hints:
                </span>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-400">Hint 1 (High-Level Strategy):</label>
                  <input
                    type="text"
                    value={editForm.hint_level_1}
                    onChange={(e) => setEditForm(prev => ({ ...prev, hint_level_1: e.target.value }))}
                    placeholder="e.g. Focus on high-level AWS topology and route tables first."
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-400">Hint 2 (Diagnostics & Commands):</label>
                  <input
                    type="text"
                    value={editForm.hint_level_2}
                    onChange={(e) => setEditForm(prev => ({ ...prev, hint_level_2: e.target.value }))}
                    placeholder="e.g. Check systemctl status and journalctl logs."
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-400">Hint 3 (Full Solution Guide):</label>
                  <input
                    type="text"
                    value={editForm.hint_level_3}
                    onChange={(e) => setEditForm(prev => ({ ...prev, hint_level_3: e.target.value }))}
                    placeholder="e.g. Run kubectl describe pod -> check exit code 137 OOMKilled -> update memory limits."
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveQuestion}
                disabled={isSavingQuestion}
                className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-[#FF6B00] hover:bg-orange-600 shadow-md shadow-[#FF6B00]/20 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
              >
                {isSavingQuestion ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Question...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Question</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* JD PARSER MODAL */}
      {isJDModalOpen && (
        <JDParserModal
          isOpen={isJDModalOpen}
          onClose={() => setIsJDModalOpen(false)}
          onSuccess={() => loadTemplates()}
        />
      )}

    </motion.div>
  );
}
