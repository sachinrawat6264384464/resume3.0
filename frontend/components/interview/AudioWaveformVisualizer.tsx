"use client";

import { useEffect, useState } from "react";
import { Mic } from "lucide-react";
import { AudioVisualizer } from "@/lib/media-recorder";

interface AudioWaveformVisualizerProps {
  stream: MediaStream | null;
  isActive: boolean;
  className?: string;
}

export function AudioWaveformVisualizer({ stream, isActive, className = "" }: AudioWaveformVisualizerProps) {
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    if (!stream || !isActive) {
      setVolume(0);
      return;
    }

    const visualizer = new AudioVisualizer();
    visualizer.init(stream);

    const interval = setInterval(() => {
      setVolume(visualizer.getVolumeLevel());
    }, 80);

    return () => {
      clearInterval(interval);
      visualizer.close();
    };
  }, [stream, isActive]);

  // Generate 12 frequency bars
  const bars = Array.from({ length: 12 }, (_, i) => {
    const factor = Math.sin((i / 11) * Math.PI);
    const height = Math.max(4, Math.min(28, (volume * 0.28 * factor) + (Math.random() * 4)));
    return height;
  });

  return (
    <div className={`flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 ${className}`}>
      <div className={`p-1.5 rounded-lg ${volume > 15 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
        <Mic className="w-4 h-4" />
      </div>

      <div className="flex items-center gap-1 h-7">
        {bars.map((h, idx) => (
          <span
            key={idx}
            className={`w-1 rounded-full transition-all duration-75 ${
              volume > 15
                ? 'bg-gradient-to-t from-indigo-500 to-cyan-400 shadow-sm shadow-cyan-400/50'
                : 'bg-slate-700'
            }`}
            style={{ height: `${h}px` }}
          />
        ))}
      </div>

      <span className="text-[11px] font-mono text-slate-400 min-w-[32px] text-right">
        {volume}%
      </span>
    </div>
  );
}
