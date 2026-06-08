"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePomodoro } from "../providers/PomodoroProvider";
import { getRecommendedPomodoro } from "@/utils/wellness";
import { Play, Pause, X, RotateCcw, Brain, Coffee, Minimize2, Maximize2 } from "lucide-react";
import { useModal } from "../providers/ModalProvider";

export default function FloatingPomodoro() {
  const { activeTaskId, activeTaskTitle, stopPomodoro, sentimentScore } = usePomodoro();
  const { showModal } = useModal();
  
  const { workMinutes, breakMinutes } = getRecommendedPomodoro(sentimentScore);

  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // When active task or sentiment changes, reset timer
  useEffect(() => {
    if (activeTaskId) {
      setMode('work');
      setTimeLeft(workMinutes * 60);
      setIsRunning(false);
      setIsMinimized(false);
    }
  }, [activeTaskId, workMinutes]);

  useEffect(() => {
    let interval: any;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((l) => l - 1), 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      const isWork = mode === 'work';
      
      // Play sound
      try {
        const audio = new Audio('/success.mp3'); // simple notification
        audio.play().catch(e => console.log(e));
      } catch(e) {}

      // Auto switch mode
      setMode(isWork ? 'break' : 'work');
      setTimeLeft(isWork ? breakMinutes * 60 : workMinutes * 60);
      
      // We could use native notification here, but sound is enough for now
      showModal({
        title: isWork ? 'Kerja Bagus! 🚀' : 'Istirahat Selesai ☕',
        message: isWork ? "Waktu Fokus Habis! Waktunya istirahat sejenak ☕" : "Waktu Istirahat Habis! Ayo fokus lagi 🚀",
        type: 'info'
      });
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, breakMinutes, workMinutes, showModal]);

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'work' ? workMinutes * 60 : breakMinutes * 60);
  };

  const skipMode = () => {
    const isWork = mode === 'work';
    setMode(isWork ? 'break' : 'work');
    setTimeLeft(isWork ? breakMinutes * 60 : workMinutes * 60);
    setIsRunning(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!activeTaskId) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 100, opacity: 0, scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 flex flex-col items-end"
      >
        <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl overflow-hidden transition-all duration-300 ${isMinimized ? 'w-48' : 'w-72'}`}>
          
          {/* Header */}
          <div className={`flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800 ${mode === 'work' ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}>
            <div className="flex items-center gap-2">
              {mode === 'work' ? <Brain className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> : <Coffee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              <span className={`text-xs font-bold uppercase tracking-wider ${mode === 'work' ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {mode === 'work' ? 'Fokus' : 'Istirahat'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition-colors text-slate-500">
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button onClick={stopPomodoro} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 rounded-md transition-colors text-slate-500">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Body */}
          {!isMinimized && (
            <div className="p-5 flex flex-col items-center">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1 text-center line-clamp-1 w-full" title={activeTaskTitle || ''}>
                {activeTaskTitle}
              </p>
              
              <div className="text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tighter tabular-nums my-4">
                {formatTime(timeLeft)}
              </div>
              
              <div className="flex items-center gap-3 w-full justify-center">
                <button 
                  onClick={toggleTimer}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white transition-all flex-1 shadow-md hover:-translate-y-0.5 ${
                    isRunning 
                      ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200 dark:shadow-none' 
                      : mode === 'work' 
                        ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none' 
                        : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200 dark:shadow-none'
                  }`}
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isRunning ? 'Pause' : 'Mulai'}
                </button>
                
                <button 
                  onClick={resetTimer}
                  className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <button 
                onClick={skipMode}
                className="mt-4 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline underline-offset-2"
              >
                Skip ke {mode === 'work' ? 'Istirahat' : 'Fokus'}
              </button>
            </div>
          )}

          {/* Minimized Body */}
          {isMinimized && (
            <div className="p-3 flex items-center justify-between cursor-pointer" onClick={() => setIsMinimized(false)}>
              <span className="text-xl font-black tabular-nums text-slate-800 dark:text-slate-200">
                {formatTime(timeLeft)}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); toggleTimer(); }}
                className={`p-2 rounded-xl text-white ${isRunning ? 'bg-amber-500' : 'bg-indigo-600'}`}
              >
                {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
