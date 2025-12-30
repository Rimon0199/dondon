// Singleton AudioContext
let audioCtx: AudioContext | null = null;
let isSoundEnabled = true;

export const setSoundEnabled = (enabled: boolean) => {
  isSoundEnabled = enabled;
  if (!enabled && audioCtx) {
    audioCtx.suspend();
  } else if (enabled && audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

const getContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

export const initAudio = () => {
  try {
    const ctx = getContext();
    if (isSoundEnabled && ctx.state === 'suspended') {
      ctx.resume();
    }
  } catch (e) {
    console.error("Audio init failed", e);
  }
};

export const playCorrectSound = () => {
  if (!isSoundEnabled) return;
  try {
    const ctx = getContext();
    if(ctx.state === 'suspended') ctx.resume();
    
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Arpeggio C Major
    osc.frequency.setValueAtTime(523.25, t); // C5
    osc.frequency.exponentialRampToValueAtTime(659.25, t + 0.1); // E5
    osc.frequency.exponentialRampToValueAtTime(783.99, t + 0.2); // G5
    osc.frequency.exponentialRampToValueAtTime(1046.50, t + 0.3); // C6

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.6);
  } catch (e) {
    console.error(e);
  }
};

export const playWrongSound = () => {
  if (!isSoundEnabled) return;
  try {
    const ctx = getContext();
    if(ctx.state === 'suspended') ctx.resume();

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.linearRampToValueAtTime(100, t + 0.4);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(145, t); // Dissonance
    osc2.frequency.linearRampToValueAtTime(95, t + 0.4);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc2.start(t);
    osc.stop(t + 0.4);
    osc2.stop(t + 0.4);
  } catch (e) {
    console.error(e);
  }
};

export const playTickSound = () => {
    if (!isSoundEnabled) return;
    try {
        const ctx = getContext();
        // Only resume if needed, but for ticks we might skip resume check for perf if strictly needed
        // but generally safest to access context.
        
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.frequency.setValueAtTime(800, t);
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.05);
    } catch(e) {}
}

export const playLifelineSound = () => {
    if (!isSoundEnabled) return;
    try {
        const ctx = getContext();
        if(ctx.state === 'suspended') ctx.resume();
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.linearRampToValueAtTime(1200, t + 0.4);
        
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.4);
    } catch(e){}
}

export const playTimeoutSound = () => {
    if (!isSoundEnabled) return;
    try {
        const ctx = getContext();
        if(ctx.state === 'suspended') ctx.resume();
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.8);
        
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.8);
    } catch(e){}
}