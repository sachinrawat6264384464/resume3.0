"use client";

import { useState, useEffect } from "react";
import { Award, ShieldCheck, Download, Loader2, Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function CertificatesPage() {
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const res = await apiFetch("/candidates/me/certificates");
        if (res?.data) {
          setCerts(res.data);
        }
      } catch (e) {
        console.warn("Certificates fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto flex flex-col gap-6 pb-12 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold w-fit">
          <Award className="w-3.5 h-3.5" />
          <span>VERIFIED CREDENTIALS</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
          Earned Certificates
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Official verified digital certificates awarded upon passing CloudOps 80%+ stage assessment gates.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      ) : certs.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <Award className="w-7 h-7" />
          </div>
          <span className="text-base font-black text-slate-900 dark:text-white">No Certificates Earned Yet</span>
          <p className="text-xs text-slate-500 max-w-md font-medium leading-relaxed">
            Complete and score 80%+ on Stage 1 to 5 Voice AI Interview Assessment Gates to earn verified digital credentials.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certs.map((c, i) => (
            <div key={i} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-900 dark:text-white">{c.title}</span>
                    <span className="text-[10px] font-mono text-slate-400">{c.certificate_code || c.code || `CERT-${c.id}`}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200">
                  Passed {c.score_percentage || c.score || 85}%
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Issued: {c.issued_at ? c.issued_at.split("T")[0] : "Recently"}</span>
                <button className="py-2 px-4 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 flex items-center gap-1.5 transition-all">
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
