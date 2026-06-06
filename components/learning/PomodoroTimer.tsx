'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';
import { useModal } from '../providers/ModalProvider';

export default function PomodoroTimer() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const { showModal } = useModal();

  useEffect(() => {
    let interval: any;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(l => l - 1), 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      const isWork = mode === 'work';
      showModal({ 
        title: isWork ? 'Kerja Bagus! 🚀' : 'Istirahat Selesai ☕', 
        message: isWork ? 'Waktu Fokus Habis! Waktunya istirahat.' : 'Waktu Istirahat Habis! Ayo fokus lagi.', 
        type: 'info' 
      });
      setMode(isWork ? 'break' : 'work');
      setTimeLeft(isWork ? 5 * 60 : 25 * 60);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode]);

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isEnabled) {
    return (
      <div className="flex justify-start mt-2">
        <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-500 font-medium">
          <input type="checkbox" checked={isEnabled} onChange={() => setIsEnabled(true)} className="rounded text-indigo-600 dark:text-indigo-400 focus:ring-indigo-500" />
          Aktifkan Pomodoro Timer
        </label>
      </div>
    );
  }

  return (
    <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-4 mt-4 flex flex-col items-center shadow-sm dark:shadow-none relative overflow-hidden">
      <div className="absolute top-2 right-2">
        <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-indigo-500 font-medium bg-white dark:bg-slate-900/50/60 hover:bg-white dark:bg-slate-900/50 px-2 py-1 rounded-md shadow-sm dark:shadow-none border border-indigo-100 transition-colors">
          <input type="checkbox" checked={isEnabled} onChange={() => { setIsEnabled(false); setIsRunning(false); }} className="rounded text-indigo-600 dark:text-indigo-400 focus:ring-indigo-500" />
          Pomodoro On
        </label>
      </div>

      <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold mb-1 uppercase tracking-widest text-[10px]">
        {mode === 'work' ? <Brain className="w-3 h-3" /> : <Coffee className="w-3 h-3" />}
        {mode === 'work' ? 'Fokus' : 'Istirahat'}
      </div>
      
      <div className="text-3xl font-black text-indigo-900 tracking-tighter tabular-nums mb-3 dark:text-indigo-200">
        {formatTime(timeLeft)}
      </div>
      
      <div className="flex gap-2 w-full justify-center">
        <button 
          onClick={toggleTimer}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all flex-1 max-w-[120px] ${isRunning ? 'bg-orange-50 dark:bg-orange-500/100 hover:bg-orange-600 shadow-orange-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'} shadow-md dark:shadow-none hover:-translate-y-0.5`}
        >
          {isRunning ? <Pause className="w-4 h-4 dark:text-white" /> : <Play className="w-4 h-4 dark:text-white" />}
          {isRunning ? 'Pause' : 'Mulai'}
        </button>
        
        <button 
          onClick={resetTimer}
          className="flex items-center justify-center p-2 rounded-xl bg-white dark:bg-slate-900/50 text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm dark:shadow-none"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button 
          onClick={() => {
            const isWork = mode === 'work';
            setMode(isWork ? 'break' : 'work');
            setTimeLeft(isWork ? 5 * 60 : 25 * 60);
            setIsRunning(false);
          }}
          className="text-[10px] text-indigo-500 font-medium hover:text-indigo-700 dark:text-indigo-300 underline px-1 flex flex-col justify-center text-center"
        >
          Skip ke<br/>{mode === 'work' ? 'Istirahat' : 'Fokus'}
        </button>
      </div>
    </div>
  );
}
