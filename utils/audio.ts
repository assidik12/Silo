'use client';

export const playSuccessSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    
    // Play a cheerful "ding-ding!" (two quick notes)
    const playNote = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime + startTime);
      // Fade in quickly
      gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + startTime + 0.02);
      // Fade out slowly
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    // Note 1: E6
    playNote(1318.51, 0, 0.15);
    // Note 2: G#6 (Higher pitch for a cheerful "pop")
    playNote(1661.22, 0.1, 0.3);
  } catch (err) {
    console.error("Audio playback failed", err);
  }
};
