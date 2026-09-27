/**
 * Audio / Video Media Recording and Speech Synthesis Utilities
 */

export class AudioVisualizer {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;

  init(stream: MediaStream) {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;
      this.source = this.audioCtx.createMediaStreamSource(stream);
      this.source.connect(this.analyser);
      this.dataArray = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));
    } catch (e) {
      console.warn("Web Audio API visualization initialization failed:", e);
    }
  }

  getVolumeLevel(): number {
    if (!this.analyser || !this.dataArray) return 0;
    this.analyser.getByteFrequencyData(this.dataArray as any);
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    const avg = sum / this.dataArray.length;
    return Math.min(100, Math.round((avg / 128) * 100));
  }

  close() {
    if (this.source) {
      try { this.source.disconnect(); } catch (e) {}
      this.source = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try { this.audioCtx.close(); } catch (e) {}
      this.audioCtx = null;
    }
  }
}

export const forceStopAllWebcams = () => {
  if (typeof window === "undefined") return;
  try {
    const videos = document.querySelectorAll("video");
    videos.forEach((vid) => {
      if (vid.srcObject) {
        const stream = vid.srcObject as MediaStream;
        stream.getTracks().forEach((track) => {
          track.stop();
          track.enabled = false;
        });
        vid.srcObject = null;
      }
      try { vid.pause(); } catch (e) {}
    });
  } catch (e) {
    console.warn("Camera force release notice:", e);
  }
};

export class QuestionRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  start(stream: MediaStream): void {
    this.recordedChunks = [];
    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4'
    ];
    let selectedMime = 'video/webm';
    for (const m of mimeTypes) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) {
        selectedMime = m;
        break;
      }
    }

    this.mediaRecorder = new MediaRecorder(stream, { mimeType: selectedMime });
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };
    this.mediaRecorder.start(1000); // 1-second chunks
  }

  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        return resolve(new Blob([], { type: 'video/webm' }));
      }
      this.mediaRecorder.onstop = () => {
        const fullBlob = new Blob(this.recordedChunks, {
          type: this.mediaRecorder?.mimeType || 'video/webm'
        });
        resolve(fullBlob);
      };
      this.mediaRecorder.onerror = (e) => reject(e);
      this.mediaRecorder.stop();
    });
  }
}

export function speakText(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): () => void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onEnd?.();
    return () => {};
  }

  // Ensure any ongoing speech is completely stopped to prevent overlapping voices
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95; // Clear, articulate speaking pace
  utterance.pitch = 0.9;  // Deep, masculine tone
  utterance.lang = "en-US";

  // List of female names to strictly exclude
  const femaleNames = [
    "samantha", "zira", "hazel", "eva", "heera", "susan", "veena", 
    "victoria", "karen", "fiona", "catherine", "linda", "serena", 
    "alice", "female", "woman", "girl"
  ];

  // Preferred Male voice identifiers
  const maleNames = [
    "david", "mark", "george", "guy", "ryan", "alex", "daniel", 
    "james", "john", "male", "man", "boy", 
    "google uk english male", "google us english male"
  ];

  const selectMaleVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // 1. Explicit Male name match in English
    let selected = voices.find((v) => {
      const nameLower = v.name.toLowerCase();
      const isFemale = femaleNames.some((f) => nameLower.includes(f));
      if (isFemale) return false;
      return maleNames.some((m) => nameLower.includes(m)) && v.lang.startsWith("en");
    });

    // 2. Fallback: Any English voice that is NOT female
    if (!selected) {
      selected = voices.find((v) => {
        const nameLower = v.name.toLowerCase();
        return !femaleNames.some((f) => nameLower.includes(f)) && v.lang.startsWith("en");
      });
    }

    // 3. Fallback: Any English voice
    if (!selected) {
      selected = voices.find((v) => v.lang.startsWith("en")) || voices[0];
    }

    return selected;
  };

  const executeSpeech = () => {
    try {
      window.speechSynthesis.cancel();
      const voice = selectMaleVoice();
      if (voice) {
        utterance.voice = voice;
      }
      utterance.pitch = 0.9; // Enforce masculine pitch
      utterance.rate = 0.95;

      utterance.onstart = () => onStart?.();
      utterance.onend = () => onEnd?.();
      utterance.onerror = () => onEnd?.();

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      onEnd?.();
    }
  };

  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    executeSpeech();
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      executeSpeech();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }

  return () => {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  };
}
