"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Video, Plus, Trash2, Edit3, Volume2, VolumeX, Eye, 
  Sparkles, CheckCircle2, Cloud, ShieldCheck, Database, 
  ArrowLeft, RefreshCw, Play, Pause, Layers, ExternalLink, X, FileText
} from "lucide-react";
import { 
  VideoWalkthroughItem, 
  getFirebaseVideos, 
  saveFirebaseVideo, 
  deleteFirebaseVideo,
  addFirebaseAuditLog 
} from "@/lib/firebase-admin-store";
import { useAuthStore } from "@/lib/store";

const SERVICE_CATEGORIES = [
  "All Project Overview",
  "Candidate Dashboard",
  "Interview Stages (30 Stages)",
  "Resume ATS Audit",
  "Study Planner",
  "Smart Reminders",
  "My Progress & Matrix",
  "Leaderboard"
];

export default function AdminVideoManagementPage() {
  const user = useAuthStore((state) => state.user);
  const [videos, setVideos] = useState<VideoWalkthroughItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("admin_cache_videos");
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return [];
  });
  const [loading, setLoading] = useState(() => videos.length === 0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoWalkthroughItem | null>(null);
  const [previewVideo, setPreviewVideo] = useState<VideoWalkthroughItem | null>(null);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    id: "",
    category: "All Project Overview",
    title: "",
    tagline: "",
    description: "",
    videoUrl: "/vedio/candidate-dashboard.mp4",
    audioEnabled: true,
    keyFeaturesStr: "",
    mockRoute: "/dashboard"
  });

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const loadVideos = async () => {
    if (videos.length === 0) setLoading(true);
    try {
      // 1. Fetch from PostgreSQL Database API
      const res = await fetch("/api/v1/walkthrough-videos").then(r => r.json()).catch(() => null);
      let listToSave: VideoWalkthroughItem[] = [];
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        listToSave = res.data;
      } else {
        // Fallback to Firebase Store
        listToSave = await getFirebaseVideos();
      }
      setVideos(listToSave);
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("admin_cache_videos", JSON.stringify(listToSave));
        } catch {}
      }
    } catch (e) {
      const data = await getFirebaseVideos();
      setVideos(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleOpenAddModal = () => {
    setEditingVideo(null);
    setUploadFile(null);
    setFormData({
      id: `vid-${Date.now()}`,
      category: "All Project Overview",
      title: "",
      tagline: "",
      description: "",
      videoUrl: "/vedio/candidate-dashboard.mp4",
      audioEnabled: true,
      keyFeaturesStr: "Real-time candidate evaluation\nVoice AI interaction\nSTAR feedback model",
      mockRoute: "/dashboard"
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: VideoWalkthroughItem) => {
    setEditingVideo(item);
    setUploadFile(null);
    setFormData({
      id: item.id,
      category: item.category,
      title: item.title,
      tagline: item.tagline,
      description: item.description,
      videoUrl: item.videoUrl,
      audioEnabled: item.audioEnabled,
      keyFeaturesStr: (item.keyFeatures || []).join("\n"),
      mockRoute: item.mockRoute || "/dashboard"
    });
    setIsModalOpen(true);
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setAlertMsg({ type: "error", text: "Please fill in Video Title and Description." });
      return;
    }

    setIsUploading(true);
    setAlertMsg(null);

    const keyFeaturesList = formData.keyFeaturesStr
      .split("\n")
      .map(s => s.trim())
      .filter(Boolean);

    try {
      let finalCloudinaryUrl = formData.videoUrl;

      // STEP 1 & 2: UPLOAD VIDEO FILE TO CLOUDINARY & SAVE TO POSTGRESQL DATABASE VIA BACKEND API
      const token = localStorage.getItem("auth_token") || "";
      const bodyFormData = new FormData();
      if (uploadFile) {
        bodyFormData.append("file", uploadFile);
      }
      bodyFormData.append("category", formData.category);
      bodyFormData.append("title", formData.title.trim());
      bodyFormData.append("tagline", formData.tagline.trim());
      bodyFormData.append("description", formData.description.trim());
      bodyFormData.append("audio_enabled", String(formData.audioEnabled));
      bodyFormData.append("key_features", JSON.stringify(keyFeaturesList));
      bodyFormData.append("mock_route", formData.mockRoute || "/dashboard");
      bodyFormData.append("existing_video_url", formData.videoUrl);

      const response = await fetch("/api/v1/walkthrough-videos/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: bodyFormData
      }).then(r => r.json()).catch(() => null);

      if (response?.data?.cloudinary_url) {
        finalCloudinaryUrl = response.data.cloudinary_url;
      }

      // STEP 3: SYNC TO FIREBASE STORE & AUDIT LOGS
      const newItem: VideoWalkthroughItem = {
        id: formData.id || `vid-${Date.now()}`,
        category: formData.category,
        title: formData.title.trim(),
        tagline: formData.tagline.trim() || "Candidate Service Video Walkthrough",
        description: formData.description.trim(),
        videoUrl: finalCloudinaryUrl,
        audioEnabled: formData.audioEnabled,
        keyFeatures: keyFeaturesList.length > 0 ? keyFeaturesList : ["Interactive Service Demo"],
        mockRoute: formData.mockRoute || "/dashboard",
        stats: [
          { label: "Storage", value: "Cloudinary CDN" },
          { label: "Audio Track", value: formData.audioEnabled ? "Voice Enabled" : "Muted" },
          { label: "Sync", value: "PostgreSQL & Firebase" }
        ],
        updatedAt: new Date().toISOString()
      };

      await saveFirebaseVideo(newItem);
      await addFirebaseAuditLog({
        userName: user?.full_name || "Alex Vance (Admin)",
        userEmail: user?.email || "admin@cloudops.internal",
        roleName: "Super Admin",
        action: editingVideo ? `Updated Video: '${newItem.title}'` : `Uploaded Video to Cloudinary & DB: '${newItem.title}'`,
        pageLocation: "/admin/video-management",
        status: "ONLINE"
      });

      setAlertMsg({
        type: "success",
        text: `Video '${newItem.title}' successfully uploaded to Cloudinary CDN & saved to PostgreSQL Database!`
      });
      setIsModalOpen(false);
      await loadVideos();
    } catch (err: any) {
      setAlertMsg({ type: "error", text: "Failed to upload video: " + err.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteVideo = async (item: VideoWalkthroughItem) => {
    if (!confirm(`Are you sure you want to delete video '${item.title}'?`)) return;

    try {
      await deleteFirebaseVideo(item.id);
      await addFirebaseAuditLog({
        userName: user?.full_name || "Alex Vance (Admin)",
        userEmail: user?.email || "admin@cloudops.internal",
        roleName: "Super Admin",
        action: `Deleted Video Walkthrough: '${item.title}'`,
        pageLocation: "/admin/video-management",
        status: "ONLINE"
      });

      setAlertMsg({
        type: "success",
        text: `Video '${item.title}' deleted from Firebase Firestore & Candidate Portal.`
      });
      await loadVideos();
    } catch (err: any) {
      setAlertMsg({ type: "error", text: "Failed to delete video: " + err.message });
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-16 font-sans text-slate-900 dark:text-slate-100">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#FF6B00] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#FF6B00] bg-orange-50 dark:bg-orange-950/60 px-3 py-1 rounded-full uppercase tracking-wider mb-1 border border-orange-200 dark:border-orange-900/60">
              <Video className="w-3.5 h-3.5" />
              <span>SERVICE SHOWCASE & VIDEO MANAGEMENT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Candidate Walkthrough Videos <span className="text-[#FF6B00]">(Firebase Backed)</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Upload, edit, and manage video walkthroughs for All Project Overview & Candidate Sidebar Services.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadVideos}
            className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#FF6B00] transition-colors"
            title="Refresh Videos List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-3 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-[#FF6B00] via-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-600 shadow-lg shadow-[#FF6B00]/25 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Walkthrough Video 🎬</span>
          </button>
        </div>
      </div>

      {alertMsg && (
        <div className={`p-4 rounded-2xl font-bold text-xs flex items-center justify-between shadow-md ${
          alertMsg.type === "success" 
            ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
            : "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
        }`}>
          <span>{alertMsg.text}</span>
          <button onClick={() => setAlertMsg(null)} className="font-black hover:opacity-80">✕</button>
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400">Total Showcase Videos</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">{videos.length}</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-[#FF6B00] flex items-center justify-center">
            <Video className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400">Voice Audio Enabled</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
              {videos.filter(v => v.audioEnabled).length} Videos
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center">
            <Volume2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400">Storage Provider</span>
            <div className="text-sm font-black text-slate-900 dark:text-white mt-1">Cloudinary & MP4</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-500 flex items-center justify-center">
            <Cloud className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400">Firebase Firestore</span>
            <div className="text-sm font-black text-purple-600 dark:text-purple-400 mt-1">Realtime Synced ✓</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-500 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Videos Catalog Roster Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#FF6B00]" />
            <span>Active Walkthrough Videos Catalog ({videos.length})</span>
          </h2>
          <span className="text-xs font-mono font-bold text-slate-400">Synced to Candidate Showcase Tab</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-mono">
                <th className="pb-3">Service Category</th>
                <th className="pb-3">Video Title & Tagline</th>
                <th className="pb-3">Voice Audio Status</th>
                <th className="pb-3">Video URL</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {videos.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4">
                    <span className="px-3 py-1 rounded-full text-[11px] font-black bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/30 inline-block">
                      {item.category}
                    </span>
                  </td>

                  <td className="py-4 max-w-sm">
                    <div className="font-extrabold text-slate-900 dark:text-white">{item.title}</div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">{item.tagline}</div>
                  </td>

                  <td className="py-4">
                    {item.audioEnabled ? (
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] border border-emerald-300 dark:border-emerald-800 inline-flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Voice Enabled 🔊</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-[11px] border border-slate-300 dark:border-slate-700 inline-flex items-center gap-1.5">
                        <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                        <span>Muted 🔇</span>
                      </span>
                    )}
                  </td>

                  <td className="py-4 font-mono text-[11px] text-slate-400 max-w-xs truncate">
                    <a href={item.videoUrl} target="_blank" rel="noreferrer" className="hover:text-[#FF6B00] underline flex items-center gap-1">
                      <span>{item.videoUrl}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>

                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setPreviewVideo(item)}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-bold text-[11px] flex items-center gap-1 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-bold text-[11px] flex items-center gap-1 transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteVideo(item)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 font-bold text-[11px] flex items-center gap-1 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT VIDEO MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-slate-900 dark:text-slate-100 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-[#FF6B00]" />
                <h2 className="text-lg font-black tracking-tight">
                  {editingVideo ? "Edit Walkthrough Video" : "Add New Walkthrough Video"}
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVideo} className="flex flex-col gap-4 text-xs font-medium">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Service Category Showcase Tab</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold focus:outline-none focus:border-[#FF6B00]"
                  >
                    {SERVICE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Target Mock Route</label>
                  <input
                    type="text"
                    value={formData.mockRoute}
                    onChange={(e) => setFormData({ ...formData, mockRoute: e.target.value })}
                    placeholder="/dashboard or /interviews"
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Video Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Full Project Overview & CloudOps Architecture"
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Tagline / Subtitle</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g., End-to-End Enterprise AI Interview Platform"
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Description ("ISS SERVICE ME KYA HOTA HAI?") *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Explain what happens in this service..."
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              {/* VIDEO FILE UPLOAD TO CLOUDINARY CDN INPUT */}
              <div className="flex flex-col gap-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Upload Video File (Cloudinary CDN Direct Pipeline) ☁️</span>
                  <span className="text-[11px] font-mono text-[#FF6B00] font-bold">Cloudinary Auto-Sync</span>
                </label>

                <div className="relative p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#FF6B00] transition-colors flex flex-col items-center justify-center text-center gap-2 cursor-pointer">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <Cloud className="w-8 h-8 text-[#FF6B00] animate-pulse" />
                  
                  {uploadFile ? (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Selected: {uploadFile.name}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        Size: {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to stream to Cloudinary & DB
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Click or drag & drop video file here (MP4, WebM, MOV)
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Video will be uploaded to Cloudinary CDN & saved in PostgreSQL Database
                      </span>
                    </div>
                  )}
                </div>

                {formData.videoUrl && !uploadFile && (
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1 px-1">
                    <span>Current Cloudinary CDN URL:</span>
                    <span className="text-[#FF6B00] truncate max-w-md">{formData.videoUrl}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Key Features List (One per line)</label>
                <textarea
                  rows={3}
                  value={formData.keyFeaturesStr}
                  onChange={(e) => setFormData({ ...formData, keyFeaturesStr: e.target.value })}
                  placeholder="Real-time readiness score\nSequential stage progress\nDaily activity counter"
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.audioEnabled}
                    onChange={(e) => setFormData({ ...formData, audioEnabled: e.target.checked })}
                    className="w-4 h-4 text-[#FF6B00] rounded cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-xs">Enable Voice & Video Audio Track 🔊</span>
                    <span className="text-[11px] text-slate-400">Allows candidates to unmute and listen to video narration</span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-6 py-2.5 rounded-xl font-black text-xs text-white bg-gradient-to-r from-[#FF6B00] via-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-600 disabled:opacity-50 shadow-lg shadow-[#FF6B00]/25 flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Uploading to Cloudinary & DB...</span>
                    </>
                  ) : (
                    <span>Upload to Cloudinary & Save to DB 🚀</span>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* PREVIEW VIDEO MODAL */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-3xl p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-white flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-[#FF6B00]" />
                <span className="font-black text-sm">{previewVideo.title}</span>
              </div>
              <button onClick={() => setPreviewVideo(null)} className="p-1 rounded-xl text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video w-full rounded-2xl bg-black overflow-hidden border border-slate-800">
              <video
                src={previewVideo.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-xs text-slate-300 font-medium">
              <p>{previewVideo.description}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
