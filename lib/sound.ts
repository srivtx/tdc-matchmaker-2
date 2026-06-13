let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function playChime(freq: number, startTime: number, duration: number, vol: number) {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, startTime);
  osc.frequency.exponentialRampToValueAtTime(freq * 1.02, startTime + duration);
  gain.gain.setValueAtTime(vol, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

function playClick() {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(1200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.025);
  gain.gain.setValueAtTime(0.008, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.035);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.035);
}

function playTick() {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(2000, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.02);
  gain.gain.setValueAtTime(0.006, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.025);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.025);
}

function playSuccess() {
  const ctx = getCtx();
  if (!ctx) return;
  const t = ctx.currentTime;
  playChime(660, t, 0.16, 0.018);
  playChime(880, t + 0.08, 0.18, 0.015);
  playChime(1100, t + 0.16, 0.22, 0.012);
}

function playError() {
  const ctx = getCtx();
  if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(200, t);
  osc.frequency.exponentialRampToValueAtTime(140, t + 0.15);
  gain.gain.setValueAtTime(0.025, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.18);
}

function playOpen() {
  const ctx = getCtx();
  if (!ctx) return;
  const t = ctx.currentTime;
  playChime(440, t, 0.1, 0.015);
  playChime(660, t + 0.04, 0.1, 0.015);
}

function playClose() {
  const ctx = getCtx();
  if (!ctx) return;
  const t = ctx.currentTime;
  playChime(660, t, 0.08, 0.015);
  playChime(440, t + 0.04, 0.08, 0.015);
}

export const sounds = {
  click: playClick,
  tick: playTick,
  success: playSuccess,
  error: playError,
  open: playOpen,
  close: playClose,
  toggle() {
    const ctx = getCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    playChime(880, t, 0.18, 0.02);
    playChime(1100, t + 0.06, 0.2, 0.015);
  },
};
