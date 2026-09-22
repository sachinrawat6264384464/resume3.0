"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X, ShieldAlert } from "lucide-react";

export interface AlertModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  type?: "success" | "error" | "warning" | "info";
  onClose: () => void;
  confirmText?: string;
}

export function AlertModal({
  isOpen,
  title,
  message,
  type = "info",
  onClose,
  confirmText = "OK"
}: AlertModalProps) {
  if (!isOpen) return null;

  // Format message cleanly to prevent [object Object]
  let displayMessage = message;
  if (typeof message === "object" && message !== null) {
    try {
      displayMessage = JSON.stringify(message, null, 2);
    } catch {
      displayMessage = String(message);
    }
  }

  const iconMap = {
    success: <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />,
    error: <ShieldAlert className="w-8 h-8 text-rose-400 shrink-0" />,
    warning: <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />,
    info: <Info className="w-8 h-8 text-cyan-400 shrink-0" />
  };

  const badgeColorMap = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    error: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    info: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
  };

  const buttonGradientMap = {
    success: "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20",
    error: "bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-400 hover:to-red-400 text-white shadow-rose-500/20",
    warning: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/20",
    info: "bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/20"
  };

  const defaultTitles = {
    success: "Success",
    error: "Action Failed",
    warning: "Attention Required",
    info: "System Message"
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full max-w-md bg-slate-900/95 border border-amber-500/30 shadow-2xl shadow-amber-500/10 rounded-2xl p-6 relative overflow-hidden flex flex-col gap-5"
        >
          {/* Top glow accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500" />

          {/* Close X icon */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon & Title */}
          <div className="flex items-start gap-4">
            {iconMap[type]}
            <div className="flex flex-col gap-1 pr-6">
              <span className={`inline-block text-[11px] font-mono tracking-wider uppercase px-2.5 py-0.5 rounded-full border w-fit font-bold ${badgeColorMap[type]}`}>
                {title || defaultTitles[type]}
              </span>
              <h3 className="text-base font-semibold text-slate-100 mt-1">
                {title || defaultTitles[type]}
              </h3>
            </div>
          </div>

          {/* Message */}
          <div className="text-sm text-slate-300 leading-relaxed max-h-60 overflow-y-auto pr-1 whitespace-pre-wrap font-sans bg-slate-950/50 p-3.5 rounded-xl border border-white/5">
            {displayMessage}
          </div>

          {/* Footer OK button */}
          <div className="flex items-center justify-end pt-2">
            <button
              onClick={onClose}
              autoFocus
              className={`px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer ${buttonGradientMap[type]}`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
