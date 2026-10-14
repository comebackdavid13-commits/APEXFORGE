// Web Audio API sounds for ApexForge

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    void audioCtx.resume();
  }
  return audioCtx;
}

interface SoundOptions {
  frequency?: number;
  duration?: number; // seconds
  type?: OscillatorType;
  attack?: number;
  decay?: number;
  volume?: number;
}

export function playTone({
  frequency = 440,
  duration = 0.15,
  type = "sine",
  attack = 0.005,
  decay = 0.12,
  volume = 0.12,
}: SoundOptions = {}) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = type;
  osc.frequency.value = frequency;

  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(volume, now + attack);
  gain.gain.exponentialRampToValueAtTime(0.001, now + attack + decay);

  osc.start(now);
  osc.stop(now + duration);
}

export function playStepComplete() {
  // A gentle but satisfying step complete
  playTone({ frequency: 520, duration: 0.12, type: "sine" });
  setTimeout(() => playTone({ frequency: 660, duration: 0.15, type: "sine", volume: 0.08 }), 60);
}

export function playStepSkip() {
  // Neutral "next" blip
  playTone({ frequency: 450, duration: 0.1, type: "sine", volume: 0.08 });
}

export function playStartRoutine() {
  // Engaged, energetic start
  playTone({ frequency: 380, duration: 0.12, type: "sine" });
  setTimeout(() => playTone({ frequency: 520, duration: 0.12, type: "sine" }), 80);
  setTimeout(() => playTone({ frequency: 720, duration: 0.16, type: "sine", volume: 0.1 }), 160);
}

export function playRoutineComplete(frequency = 600) {
  // Triumphant finish
  playTone({ frequency: 523, duration: 0.15, type: "sine", volume: 0.10 });
  setTimeout(() => playTone({ frequency: 659, duration: 0.15, type: "sine", volume: 0.10 }), 120);
  setTimeout(() => playTone({ frequency: 784, duration: 0.22, type: "sine", volume: 0.12 }), 240);
  setTimeout(() => playTone({ frequency: frequency * 4, duration: 0.3, type: "square", volume: 0.04 }), 350);
}

export function playClick() {
  playTone({ frequency: 600, duration: 0.06, type: "sine", volume: 0.05 });
}
