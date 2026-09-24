"use client";

import { useEffect, useState } from "react";
import { 
  CreditCard, ShieldCheck, CheckCircle2, Save, RefreshCw, 
  Lock, Eye, EyeOff, Loader2, Activity, Settings, User, Mail,
  Phone, Plus, Search, Filter, Tag, ArrowUpRight
} from "lucide-react";
import { apiFetch } from "@/lib/api";

interface PaymentTx {
  id: string;
  candidate_id?: string;
  candidate_name?: string;
  candidate_email?: string;
  candidate_phone?: string;
  provider: string;
  transaction_id: string;
  order_id?: string;
  amount: string;
  currency: string;
  status: string;
  payment_method?: string;
  coupon_code?: string;
  created_at: string;
}

export default function AdminPaymentGatewayPage() {
  const [provider, setProvider] = useState("razorpay");
  const [isEnabled, setIsEnabled] = useState(true);
  const [isTestMode, setIsTestMode] = useState(true);
  const [publishableKey, setPublishableKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [amount, setAmount] = useState("1");
  const [hasSecretKey, setHasSecretKey] = useState(false);

  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [transactions, setTransactions] = useState<PaymentTx[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // New Transaction Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTxName, setNewTxName] = useState("");
  const [newTxEmail, setNewTxEmail] = useState("");
  const [newTxPhone, setNewTxPhone] = useState("");
  const [newTxAmount, setNewTxAmount] = useState("1499");
  const [newTxMethod, setNewTxMethod] = useState("UPI / GPay");
  const [newTxCoupon, setNewTxCoupon] = useState("");
  const [creatingTx, setCreatingTx] = useState(false);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const [cfgRes, txRes] = await Promise.all([
        apiFetch("/admin/payment-gateway/config").catch(() => null),
        apiFetch("/admin/payment-gateway/transactions").catch(() => null)
      ]);

      if (cfgRes?.data) {
        setProvider(cfgRes.data.provider_name || "razorpay");
        setIsEnabled(cfgRes.data.is_enabled ?? false);
        setIsTestMode(cfgRes.data.is_test_mode ?? true);
        setPublishableKey(cfgRes.data.publishable_key || "");
        setHasSecretKey(cfgRes.data.has_secret_key ?? false);
        setCurrency(cfgRes.data.currency || "INR");
        setAmount(cfgRes.data.amount || "1");
      }
      if (txRes?.data) {
        setTransactions(Array.isArray(txRes.data) ? txRes.data : []);
      }
    } catch (e: any) {
      console.warn("Failed to fetch payment config/transactions:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleToggleEnabled = async (newVal: boolean) => {
    setIsEnabled(newVal);
    try {
      const res = await apiFetch("/admin/payment-gateway/config", {
        method: "POST",
        body: JSON.stringify({
          provider_name: "razorpay",
          is_enabled: newVal,
          is_test_mode: isTestMode,
          publishable_key: publishableKey,
          webhook_secret: webhookSecret,
          currency: currency,
          amount: amount
        })
      });
      if (res?.data && res.data.is_enabled !== undefined) {
        setIsEnabled(res.data.is_enabled);
      }
      setMsg({
        type: "success",
        text: `Payment Gateway is now ${newVal ? "ENABLED (Payment Required for Stages)" : "DISABLED (Free Access to All Stages)"} in Database!`
      });
    } catch (err: any) {
      setIsEnabled(!newVal);
      setMsg({
        type: "error",
        text: `Failed to update toggle: ${err.message || 'Unknown error'}`
      });
    }
  };

  const handleToggleTestMode = async (newVal: boolean) => {
    setIsTestMode(newVal);
    try {
      const res = await apiFetch("/admin/payment-gateway/config", {
        method: "POST",
        body: JSON.stringify({
          provider_name: "razorpay",
          is_enabled: isEnabled,
          is_test_mode: newVal,
          publishable_key: publishableKey,
          webhook_secret: webhookSecret,
          currency: currency,
          amount: amount
        })
      });
      if (res?.data && res.data.is_test_mode !== undefined) {
        setIsTestMode(res.data.is_test_mode);
      }
      setMsg({
        type: "success",
        text: `Environment mode updated to ${newVal ? "Sandbox Test Mode" : "Production Live Mode"} in Database!`
      });
    } catch (err: any) {
      setIsTestMode(!newVal);
      setMsg({
        type: "error",
        text: `Failed to update environment mode: ${err.message || 'Unknown error'}`
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      const res = await apiFetch("/admin/payment-gateway/config", {
        method: "POST",
        body: JSON.stringify({
          provider_name: "razorpay",
          is_enabled: isEnabled,
          is_test_mode: isTestMode,
          publishable_key: publishableKey,
          secret_key: secretKey,
          webhook_secret: webhookSecret,
          currency: currency,
          amount: amount
        })
      });

      setMsg({
        type: "success",
        text: res?.message || "Razorpay Gateway credentials & assessment fee saved successfully to database."
      });
      setHasSecretKey(true);
      setSecretKey("");
    } catch (err: any) {
      setMsg({
        type: "error",
        text: err.message || "Failed to save payment gateway configuration."
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTxName || !newTxEmail || !newTxAmount) return;

    setCreatingTx(true);
    try {
      const res = await apiFetch("/admin/payment-gateway/transactions", {
        method: "POST",
        body: JSON.stringify({
          candidate_name: newTxName,
          candidate_email: newTxEmail,
          candidate_phone: newTxPhone || "+91 98765 43210",
          amount: newTxAmount.startsWith("₹") ? newTxAmount : `₹${newTxAmount}`,
          payment_method: newTxMethod,
          coupon_code: newTxCoupon || "-",
          provider: "razorpay",
          status: "success"
        })
      });

      if (res?.data) {
        setIsModalOpen(false);
        setNewTxName("");
        setNewTxEmail("");
        setNewTxPhone("");
        setNewTxAmount("1499");
        setNewTxCoupon("");
        await fetchConfig();
      }
    } catch (err: any) {
      alert("Failed to record transaction: " + err.message);
    } finally {
      setCreatingTx(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = 
      (tx.candidate_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.candidate_email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.transaction_id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.coupon_code || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || tx.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const totalRevenue = transactions.reduce((acc, tx) => {
    if (tx.status.toLowerCase() === "success") {
      const num = parseInt((tx.amount || "0").replace(/[^0-9]/g, ""), 10) || 0;
      return acc + num;
    }
    return acc;
  }, 0);

  return (
    <div className="w-full flex flex-col gap-6 pb-16 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6B00] via-amber-500 to-orange-500 p-[1px] shadow-lg shadow-[#FF6B00]/20 shrink-0">
            <div className="w-full h-full bg-[#0B1E36] rounded-[15px] flex items-center justify-center text-[#FF6B00]">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Payment Gateway Setup & Candidate History
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Manage Razorpay API credentials and view complete candidate payment transaction history saved in database.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#FF6B00] to-amber-500 hover:from-orange-500 hover:to-amber-600 flex items-center gap-2 transition-all shadow-md shadow-[#FF6B00]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Record Payment
          </button>
          
          <button
            onClick={fetchConfig}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Gateway Configuration Form (6 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-5">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#FF6B00]" />
              Razorpay Provider Credentials
            </h2>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
              isEnabled ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
            }`}>
              {isEnabled ? "● Payment Gateway Active" : "○ Payment Gateway Disabled"}
            </span>
          </div>

          {msg && (
            <div className={`p-4 rounded-2xl text-xs font-bold border flex items-center gap-2 ${
              msg.type === "success" 
                ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                : "bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300"
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{msg.text}</span>
            </div>
          )}

          {/* Active Status Badge & Mode Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
          {/* PERMANENT ACTIVE PAYMENT GATEWAY SYSTEM STATUS BAR */}
          <div className="p-5 rounded-2xl border-2 transition-all flex items-center justify-between shadow-lg bg-gradient-to-r from-emerald-950/80 via-emerald-900/40 to-slate-900 border-emerald-500/80 shadow-emerald-500/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black shadow-md bg-emerald-600 shadow-emerald-600/40">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>

              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm font-black text-white uppercase tracking-tight">
                    PAYMENT GATEWAY SYSTEM STATUS:
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950">
                    🟢 GATEWAY ACTIVE
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-300">
                  Candidates MUST pay fee to unlock Stages 6-30 (Payment Gateway Enabled)
                </span>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider shrink-0 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ALWAYS ON</span>
            </div>
          </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Environment Mode</span>
                <span className="text-[10px] text-slate-400">{isTestMode ? "Sandbox Test Mode" : "Production Live Mode"}</span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleTestMode(!isTestMode)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer border transition-all ${
                  isTestMode 
                    ? "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800 hover:bg-amber-200"
                    : "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800 hover:bg-emerald-200"
                }`}
              >
                {isTestMode ? "🧪 Test Mode" : "⚡ Live Mode"}
              </button>
            </div>

          </div>

          {/* Candidate Assessment Prep Fee Input */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#FF6B00]" />
                Candidate Prep Fee / Stage Access Price (INR ₹):
              </label>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30">
                ₹{amount || "1"} per Candidate
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-black text-[#FF6B00] font-mono">₹</span>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl text-xs font-mono font-bold bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00]"
              />
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              Specify the payment amount (in ₹ INR) candidates must pay to unlock stages when payment gateway is enabled.
            </span>
          </div>

          {/* Active Provider Card */}
          <div className="p-4 rounded-2xl bg-[#FF6B00]/10 border border-[#FF6B00]/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center font-black text-sm">
                RZP
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-900 dark:text-white">Razorpay (India)</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Primary Payment Engine • INR (₹) Supported</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-[#FF6B00] text-white">
              ACTIVE
            </span>
          </div>

          {/* Publishable / Key ID */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-[#FF6B00]" />
              Razorpay API Key ID:
            </label>
            <input
              type="text"
              value={publishableKey}
              onChange={(e) => setPublishableKey(e.target.value)}
              placeholder="rzp_test_xxxxxxxxxxxxxx"
              className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#FF6B00]"
            />
          </div>

          {/* Secret Key */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#FF6B00]" />
                Razorpay Secret Key (Encrypted in DB):
              </label>
              {hasSecretKey && (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  ✓ Configured in DB
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showSecret ? "text" : "password"}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder={hasSecretKey ? "•••••••••••••••••••• (Saved in DB)" : "Enter Razorpay secret key..."}
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#FF6B00]"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Webhook Secret */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Webhook Verification Secret (Optional):
            </label>
            <input
              type="text"
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              placeholder="e.g. whsec_xxxxxxxxxxxxxx"
              className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#FF6B00]"
            />
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-[#FF6B00] via-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-600 shadow-md shadow-[#FF6B00]/25 flex items-center justify-center gap-2 transition-all cursor-pointer uppercase tracking-wider mt-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving to Database...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Razorpay Credentials</span>
              </>
            )}
          </button>

        </form>

        {/* Security & Quick Stats (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          {/* Revenue & Transaction Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 flex flex-col gap-1">
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                Total DB Revenue
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                ₹{totalRevenue.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                Verified Candidate DB Payments
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#FF6B00]/10 to-amber-500/10 border border-[#FF6B00]/30 flex flex-col gap-1">
              <span className="text-[11px] font-bold text-[#FF6B00] uppercase tracking-wider">
                Total Transactions
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {transactions.length}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                Recorded in PostgreSQL DB
              </span>
            </div>
          </div>

          {/* PCI Security Banner */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-black text-[#FF6B00] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#FF6B00]" />
              <span>PCI-DSS Isolation & Direct DB Persistence</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Payment credentials and candidate payment records are persisted directly in PostgreSQL backend tables (`payment_transactions` & `payment_gateway_configs`). Zero local storage or mock array fallbacks are used.
            </p>
          </div>

        </div>

      </div>

      {/* Comprehensive Candidate Payment History Audit Log Table */}
      <div className="w-full p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-5 mt-2">
        
        {/* Table Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-950 text-[#FF6B00]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                Candidate Payment History & Revenue Audit Logs
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live database audit stream of candidate course purchases, prep upgrades, and payment methods.
              </p>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidate name, email, transaction..."
                className="pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00] w-64"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {["all", "success", "pending"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                    statusFilter === st
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                <th className="py-3 px-4">Candidate Information</th>
                <th className="py-3 px-4">Transaction & Order ID</th>
                <th className="py-3 px-4">Provider & Method</th>
                <th className="py-3 px-4">Coupon Applied</th>
                <th className="py-3 px-4">Amount Paid</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    No payment transactions found in database matching your filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    
                    {/* Candidate Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#FF6B00]" />
                          {tx.candidate_name || "Candidate User"}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {tx.candidate_email || "N/A"}
                        </span>
                        {tx.candidate_phone && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {tx.candidate_phone}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Transaction & Order ID */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold font-mono text-slate-900 dark:text-white">
                          {tx.transaction_id}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {tx.order_id || "-"}
                        </span>
                      </div>
                    </td>

                    {/* Provider & Payment Method */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[11px]">
                          {tx.provider || "Razorpay"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {tx.payment_method || "UPI / GPay"}
                        </span>
                      </div>
                    </td>

                    {/* Coupon */}
                    <td className="py-3.5 px-4">
                      {tx.coupon_code && tx.coupon_code !== "-" ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 inline-flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5" />
                          {tx.coupon_code}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-black font-mono text-slate-900 dark:text-white text-sm">
                      {tx.amount}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        tx.status.toLowerCase() === "success"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          : tx.status.toLowerCase() === "pending"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                      }`}>
                        {tx.status}
                      </span>
                    </td>

                    {/* Created At */}
                    <td className="py-3.5 px-4 text-[11px] text-slate-500 font-mono">
                      {tx.created_at ? new Date(tx.created_at).toLocaleString("en-IN", {
                        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                      }) : "Just now"}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Record New Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl flex flex-col gap-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#FF6B00]" />
                Record New Candidate Payment in Database
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="flex flex-col gap-4">
              
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Candidate Full Name *</label>
                <input
                  type="text"
                  required
                  value={newTxName}
                  onChange={(e) => setNewTxName(e.target.value)}
                  placeholder="e.g. Sachin Rawat"
                  className="px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Candidate Email *</label>
                  <input
                    type="email"
                    required
                    value={newTxEmail}
                    onChange={(e) => setNewTxEmail(e.target.value)}
                    placeholder="candidate@cloudops.ai"
                    className="px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Candidate Phone</label>
                  <input
                    type="text"
                    value={newTxPhone}
                    onChange={(e) => setNewTxPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Amount (₹) *</label>
                  <input
                    type="text"
                    required
                    value={newTxAmount}
                    onChange={(e) => setNewTxAmount(e.target.value)}
                    placeholder="1499"
                    className="px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Payment Method</label>
                  <select
                    value={newTxMethod}
                    onChange={(e) => setNewTxMethod(e.target.value)}
                    className="px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00]"
                  >
                    <option value="UPI / GPay">UPI / GPay</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Debit Card">Debit Card</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Coupon Code</label>
                  <input
                    type="text"
                    value={newTxCoupon}
                    onChange={(e) => setNewTxCoupon(e.target.value)}
                    placeholder="CLOUDOPS50"
                    className="px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTx}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#FF6B00] hover:bg-orange-600 flex items-center gap-2 cursor-pointer shadow-md shadow-[#FF6B00]/25 disabled:opacity-50"
                >
                  {creatingTx ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Record to DB
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
