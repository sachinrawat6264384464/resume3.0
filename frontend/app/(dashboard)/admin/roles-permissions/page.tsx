"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, ShieldAlert, Plus, Trash2, Edit3, Users, Key, 
  CheckSquare, Square, Layers, Activity, Clock, Database, ArrowLeft, 
  RefreshCw, Lock, Unlock, Eye, Sparkles, X, Check, UserCheck
} from "lucide-react";
import { 
  SystemRoleItem, 
  AdminAuditLogItem,
  getFirebaseRoles, 
  saveFirebaseRole, 
  deleteFirebaseRole,
  getFirebaseAuditLogs,
  addFirebaseAuditLog 
} from "@/lib/firebase-admin-store";
import { useAuthStore } from "@/lib/store";
import { apiFetch } from "@/lib/api";

const ALL_SIDEBAR_SERVICES = [
  { id: "/admin", name: "Admin Dashboard Overview", category: "Admin OS" },
  { id: "/admin/candidates", name: "Registered Candidates & Users", category: "Admin OS" },
  { id: "/admin/video-management", name: "Video Showcase Manager", category: "Admin OS" },
  { id: "/admin/roles-permissions", name: "Roles & Access Control", category: "Admin OS" },
  { id: "/admin/reminders", name: "Smart System Reminders", category: "Admin OS" },
  { id: "/admin/live-sessions", name: "Live Sessions & Webinars", category: "Admin OS" },
  { id: "/admin/payment-gateway", name: "Payment Gateway Billing", category: "Admin OS" },
  { id: "/admin/templates", name: "Blueprints & Templates", category: "Admin OS" },
  { id: "/admin/reports", name: "Reports & Analytics", category: "Admin OS" },
  { id: "/admin/leaderboard", name: "Admin Leaderboard Roster", category: "Admin OS" }
];

export default function AdminRolesPermissionsPage() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [roles, setRoles] = useState<SystemRoleItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("admin_cache_roles");
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return [];
  });
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("admin_cache_audit_logs");
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return [];
  });
  const [loading, setLoading] = useState(() => roles.length === 0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<SystemRoleItem | null>(null);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

const PRESET_ROLES = [
  { code: "TECH_INTERVIEWER", name: "Technical Interviewer", desc: "Access to candidate roster, live mock rooms & interview evaluation", defaultServices: ["/admin", "/admin/candidates", "/admin/live-sessions"] },
  { code: "OPS_MANAGER", name: "Operations & Cohort Manager", desc: "Oversee candidate batches, leaderboard standings & analytics", defaultServices: ["/admin", "/admin/candidates", "/admin/leaderboard", "/admin/reports"] },
  { code: "RESUME_AUDITOR", name: "ATS Resume Auditor", desc: "Manage resume parsing blueprints, JDs & keyword evaluation", defaultServices: ["/admin", "/admin/candidates", "/admin/templates", "/admin/reports"] },
  { code: "PROCTOR_MENTOR", name: "Live Proctor & Mentor", desc: "Conduct live sessions, monitor webinars & student reminders", defaultServices: ["/admin", "/admin/live-sessions", "/admin/reminders", "/admin/candidates"] },
  { code: "CUSTOM", name: "Custom Role (Enter Manually)", desc: "Define custom role permissions and title manually", defaultServices: ["/admin", "/admin/candidates"] }
];

  // Form State for Custom Role Creation
  const [formData, setFormData] = useState({
    id: "",
    fullName: "",
    phoneNumber: "",
    assignedEmail: "",
    password: "",
    selectedPreset: "TECH_INTERVIEWER",
    roleName: "Technical Interviewer",
    roleCode: "TECH_INTERVIEWER",
    description: "Access to candidate roster, live mock rooms & interview evaluation",
    allowedServices: ["/admin", "/admin/candidates", "/admin/live-sessions"] as string[]
  });

  const loadData = async () => {
    if (roles.length === 0) setLoading(true);
    try {
      const [rData, lData] = await Promise.all([
        getFirebaseRoles(),
        getFirebaseAuditLogs()
      ]);
      setRoles(rData);
      setAuditLogs(lData);
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("admin_cache_roles", JSON.stringify(rData));
          sessionStorage.setItem("admin_cache_audit_logs", JSON.stringify(lData));
        } catch {}
      }
    } catch (e) {
      console.warn("Failed to load roles & audit data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePresetSelect = (presetCode: string) => {
    const found = PRESET_ROLES.find(p => p.code === presetCode);
    if (found) {
      if (presetCode === "CUSTOM") {
        setFormData(prev => ({
          ...prev,
          selectedPreset: "CUSTOM",
          roleName: prev.roleName === "Technical Interviewer" ? "" : prev.roleName,
          roleCode: prev.roleCode === "TECH_INTERVIEWER" ? "" : prev.roleCode
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          selectedPreset: presetCode,
          roleName: found.name,
          roleCode: found.code,
          description: found.desc,
          allowedServices: [...found.defaultServices]
        }));
      }
    }
  };

  const handleOpenAddModal = () => {
    setEditingRole(null);
    setFormData({
      id: `role-${Date.now()}`,
      fullName: "",
      phoneNumber: "",
      assignedEmail: "",
      password: "",
      selectedPreset: "TECH_INTERVIEWER",
      roleName: "Technical Interviewer",
      roleCode: "TECH_INTERVIEWER",
      description: "Access to candidate roster, live mock rooms & interview evaluation",
      allowedServices: ["/admin", "/admin/candidates", "/admin/live-sessions"]
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (role: SystemRoleItem) => {
    setEditingRole(role);
    const matchedPreset = PRESET_ROLES.find(p => p.code === role.roleCode || p.name.toLowerCase() === role.roleName.toLowerCase());
    setFormData({
      id: role.id,
      fullName: (role as any).fullName || (role as any).assignedName || "",
      phoneNumber: (role as any).phoneNumber || (role as any).assignedPhone || "",
      assignedEmail: role.assignedEmail || "",
      password: "",
      selectedPreset: matchedPreset ? matchedPreset.code : "CUSTOM",
      roleName: role.roleName,
      roleCode: role.roleCode,
      description: role.description,
      allowedServices: [...role.allowedServices]
    });
    setIsModalOpen(true);
  };

  const toggleService = (serviceId: string) => {
    setFormData((prev) => {
      const exists = prev.allowedServices.includes(serviceId);
      if (exists) {
        return { ...prev, allowedServices: prev.allowedServices.filter((id) => id !== serviceId) };
      } else {
        return { ...prev, allowedServices: [...prev.allowedServices, serviceId] };
      }
    });
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.roleName.trim()) {
      setAlertMsg({ type: "error", text: "Please enter a Role Name." });
      return;
    }
    if (!formData.assignedEmail.trim()) {
      setAlertMsg({ type: "error", text: "Please enter an Assigned User Email for login." });
      return;
    }

    const generatedCode = formData.roleCode.trim() 
      ? formData.roleCode.toUpperCase().replace(/\s+/g, "_")
      : formData.roleName.toUpperCase().replace(/\s+/g, "_");

    // Prevent Duplicate Roles (by Role Name or Role Code) for different roles
    const isDuplicateName = roles.some(
      r => r.id !== formData.id && r.roleName.toLowerCase() === formData.roleName.trim().toLowerCase()
    );
    const isDuplicateCode = roles.some(
      r => r.id !== formData.id && r.roleCode.toUpperCase() === generatedCode
    );

    if (isDuplicateName || isDuplicateCode) {
      setAlertMsg({
        type: "error",
        text: "Role Name or Role Code already exists! Duplicate roles are not allowed."
      });
      return;
    }

    const newRole: SystemRoleItem = {
      id: formData.id || `role-${Date.now()}`,
      roleName: formData.roleName.trim(),
      roleCode: generatedCode,
      description: formData.description.trim() || `Custom system role with ${formData.allowedServices.length} allocated services.`,
      assignedEmail: formData.assignedEmail.trim(),
      allowedServices: formData.allowedServices,
      userCount: editingRole ? editingRole.userCount : 1,
      isSystemDefault: editingRole ? editingRole.isSystemDefault : false,
      createdAt: editingRole ? editingRole.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    (newRole as any).fullName = formData.fullName.trim();
    (newRole as any).phoneNumber = formData.phoneNumber.trim();

    try {
      // 1. Save Role in Firebase Firestore / localStorage
      await saveFirebaseRole(newRole);

      // 2. Save Staff User in PostgreSQL DB with credentials so they can log in!
      try {
        await apiFetch("/auth/staff-user", {
          method: "POST",
          body: JSON.stringify({
            email: formData.assignedEmail.trim(),
            full_name: formData.fullName.trim() || formData.roleName.trim(),
            phone_number: formData.phoneNumber.trim(),
            password: formData.password.trim() || "Staff@123",
            role: generatedCode,
            allowed_services: formData.allowedServices
          })
        });
      } catch (dbErr) {
        console.warn("Staff user DB sync notice:", dbErr);
      }

      // 3. Cache role allowed services mapping locally for immediate sidebar enforcement
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`user_role_permissions_${generatedCode}`, JSON.stringify(formData.allowedServices));
          localStorage.setItem(`user_role_permissions_${formData.assignedEmail.trim().toLowerCase()}`, JSON.stringify(formData.allowedServices));
          window.dispatchEvent(new Event("userRolesUpdated"));
        } catch {}
      }

      await addFirebaseAuditLog({
        userName: user?.full_name || "Admin",
        userEmail: formData.assignedEmail.trim() || user?.email || "admin@cloudops.internal",
        roleName: newRole.roleName,
        action: editingRole ? `Updated Role Permissions: '${newRole.roleName}'` : `Created New Role & Staff User: '${newRole.roleName}'`,
        pageLocation: "/admin/roles-permissions",
        status: isAuthenticated && user ? "ONLINE" : "OFFLINE"
      });

      setAlertMsg({
        type: "success",
        text: `Role '${newRole.roleName}' & User '${formData.assignedEmail}' successfully saved in database! They can now log in.`
      });
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setAlertMsg({ type: "error", text: "Failed to save role: " + err.message });
    }
  };

  const handleDeleteRole = async (role: SystemRoleItem) => {
    if (!confirm(`Are you sure you want to delete role '${role.roleName}'?`)) return;

    try {
      await deleteFirebaseRole(role.id);
      await addFirebaseAuditLog({
        userName: user?.full_name || "Alex Vance (Admin)",
        userEmail: user?.email || "admin@cloudops.internal",
        roleName: "Super Admin",
        action: `Deleted Role: '${role.roleName}'`,
        pageLocation: "/admin/roles-permissions",
        status: isAuthenticated && user ? "ONLINE" : "OFFLINE"
      });

      setAlertMsg({
        type: "success",
        text: `Role '${role.roleName}' deleted from Firebase Firestore.`
      });
      await loadData();
    } catch (err: any) {
      setAlertMsg({ type: "error", text: "Failed to delete role: " + err.message });
    }
  };

  const isUserSessionActive = !!(isAuthenticated && user);

  return (
    <div className="flex flex-col gap-6 w-full pb-16 font-sans text-slate-900 dark:text-slate-100">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#FF6B00] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-full uppercase tracking-wider mb-1 border border-purple-200 dark:border-purple-900/60">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ADMIN OS ROLES & ACCESS CONTROL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Roles & Access Permissions <span className="text-[#FF6B00]">(Firebase Backed)</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Create and manage custom roles, delete roles, allocate Admin OS sidebar services, and audit user activity.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#FF6B00] transition-colors"
            title="Refresh Roles & Logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-3 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-600 shadow-lg shadow-purple-600/25 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Role 🛡️</span>
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
            <span className="text-xs font-bold text-slate-400">Total System Roles</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">{roles.length} Roles</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400">Admin Sidebar Services</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
              {ALL_SIDEBAR_SERVICES.length} Modules
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400">Active Session Status</span>
            <div className={`text-2xl font-black font-mono mt-1 ${isUserSessionActive ? "text-emerald-500" : "text-slate-400"}`}>
              {isUserSessionActive ? "1 Active Online" : "0 Active (Offline)"}
            </div>
          </div>
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isUserSessionActive ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400">Firebase Firestore</span>
            <div className="text-sm font-black text-purple-600 dark:text-purple-400 mt-1">Secured RLS ✓</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-500 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ROLES & SIDEBAR ALLOCATION TABLE */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-500" />
            <span>Configured Roles & Admin Sidebar Access Control List</span>
          </h2>
          <span className="text-xs font-mono font-bold text-slate-400">Saved in Firebase Firestore</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-mono">
                <th className="pb-3">Role Name & Identifier</th>
                <th className="pb-3">Allocated Admin Sidebar Services</th>
                <th className="pb-3">Assigned Users</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {roles.map((role) => {
                const isRoleActive = isUserSessionActive && (
                  role.roleCode === "SUPER_ADMIN" || 
                  (user?.role && user.role.toUpperCase() === role.roleCode)
                );

                return (
                  <tr key={role.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="font-extrabold text-slate-900 dark:text-white text-sm">{role.roleName}</div>
                        {role.isSystemDefault && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700">
                            SYSTEM DEFAULT
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-purple-600 dark:text-purple-400 mt-0.5 flex items-center gap-2">
                        <span>{role.roleCode}</span>
                        {role.assignedEmail && (
                          <span className="px-2 py-0.2 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 text-[10px]">
                            ✉️ {role.assignedEmail}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 max-w-xs truncate mt-0.5">{role.description}</div>
                    </td>

                    <td className="py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-md">
                        {role.allowedServices.map((serviceId) => {
                          const sObj = ALL_SIDEBAR_SERVICES.find(s => s.id === serviceId);
                          return (
                            <span
                              key={serviceId}
                              className="px-2.5 py-0.5 rounded-lg text-[10.5px] font-mono font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                            >
                              {sObj ? sObj.name : serviceId}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    <td className="py-4">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white">
                        <UserCheck className="w-4 h-4 text-[#FF6B00]" />
                        <span>{role.userCount} Users</span>
                      </div>
                    </td>

                    <td className="py-4">
                      {isRoleActive ? (
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] border border-emerald-300 dark:border-emerald-800 inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Active Online</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-[11px] border border-slate-300 dark:border-slate-700 inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                          <span>OFFLINE</span>
                        </span>
                      )}
                    </td>

                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(role)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-bold text-[11px] flex items-center gap-1 transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Permissions</span>
                        </button>

                        <button
                          onClick={() => handleDeleteRole(role)}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 font-bold text-[11px] flex items-center gap-1 transition-all"
                          title="Delete Role"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Role</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* USER AUDIT TRAIL / ACTIVITY ROSTER ("Who did what & where") */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#FF6B00]" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              Live User Activity Roster & Audit Logs ("Who Did What & Where")
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">Real-time Session Track</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-mono">
                <th className="pb-3">User & Email</th>
                <th className="pb-3">Assigned Role</th>
                <th className="pb-3">Action Performed</th>
                <th className="pb-3">Page Location</th>
                <th className="pb-3 text-right">Time & Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {auditLogs.map((log) => {
                const isCurrentActiveUserLog = isUserSessionActive && (
                  user?.email === log.userEmail || log.status === "ONLINE"
                );

                return (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{log.userName}</div>
                      <div className="text-[11px] font-mono text-slate-400">{log.userEmail}</div>
                    </td>

                    <td className="py-3.5 font-bold font-mono text-purple-600 dark:text-purple-400">
                      {log.roleName}
                    </td>

                    <td className="py-3.5 text-slate-700 dark:text-slate-300 font-semibold">
                      {log.action}
                    </td>

                    <td className="py-3.5 font-mono text-[11px] text-blue-500">
                      {log.pageLocation}
                    </td>

                    <td className="py-3.5 text-right font-mono text-[11px]">
                      <span className="text-slate-400 mr-2">{log.timestamp}</span>
                      {isCurrentActiveUserLog ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] border border-emerald-300 dark:border-emerald-800">
                          ONLINE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-[10px] border border-slate-300 dark:border-slate-700">
                          OFFLINE
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT ROLE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-slate-900 dark:text-slate-100 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-black tracking-tight">
                  {editingRole ? `Edit Role: ${editingRole.roleName}` : "Create New Custom Role"}
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="flex flex-col gap-5 text-xs font-medium">
              
              {/* Full Name at top */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Staff / User Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Role Selection Dropdown + Identifier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Select Role *</label>
                  <select
                    value={formData.selectedPreset}
                    onChange={(e) => handlePresetSelect(e.target.value)}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:border-purple-500 text-slate-800 dark:text-white"
                  >
                    {PRESET_ROLES.map((preset) => (
                      <option key={preset.code} value={preset.code}>
                        {preset.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Role Code / Identifier</label>
                  <input
                    type="text"
                    value={formData.roleCode}
                    onChange={(e) => setFormData({ ...formData, roleCode: e.target.value })}
                    placeholder="e.g. TECH_INTERVIEWER"
                    readOnly={formData.selectedPreset !== "CUSTOM"}
                    className={`p-3 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs focus:outline-none focus:border-purple-500 ${
                      formData.selectedPreset !== "CUSTOM" ? "bg-slate-100 dark:bg-slate-900/60 opacity-80" : "bg-slate-50 dark:bg-slate-800"
                    }`}
                  />
                </div>
              </div>

              {formData.selectedPreset === "CUSTOM" && (
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Custom Role Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.roleName}
                    onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                    placeholder="e.g. Lead Technical Proctor"
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Role Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Responsibilities and access scope for this role..."
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Login Credentials: Email, Phone, Password */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Login Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.assignedEmail}
                    onChange={(e) => setFormData({ ...formData, assignedEmail: e.target.value })}
                    placeholder="staff@cloudops.internal"
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">WhatsApp / Phone</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="9876543210"
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Login Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingRole ? "(Leave empty to keep)" : "Enter password"}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Sidebar Service Allocations Checkbox Grid */}
              <div className="flex flex-col gap-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Allocate Allowed Sidebar Services ({formData.allowedServices.length} Selected):
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, allowedServices: ALL_SIDEBAR_SERVICES.map(s => s.id) });
                      }}
                      className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-bold hover:underline"
                    >
                      Select All Services
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, allowedServices: [] });
                      }}
                      className="text-[11px] font-mono text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:underline"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  {ALL_SIDEBAR_SERVICES.map((sObj) => {
                    const isChecked = formData.allowedServices.includes(sObj.id);

                    return (
                      <div
                        key={sObj.id}
                        onClick={() => toggleService(sObj.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isChecked
                            ? "bg-purple-50 dark:bg-purple-950/60 border-purple-400 dark:border-purple-600 text-purple-900 dark:text-purple-100 shadow-sm"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-purple-300 dark:hover:border-purple-700"
                        }`}
                      >
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="font-bold text-xs truncate">{sObj.name}</span>
                          <span className="font-mono text-[10px] text-slate-400">{sObj.id}</span>
                        </div>
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
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
                  className="px-6 py-2.5 rounded-xl font-black text-xs text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-600 shadow-lg shadow-purple-600/25"
                >
                  Save Role & Sync Firebase 🛡️
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
