"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Wand2 } from "lucide-react";

interface JournalInputProps {
  onSubmit: (text: string) => Promise<void>;
  isLoading: boolean;
  selectedPersona: 'aesthetic' | 'savage' | 'mindful';
  onPersonaChange: (persona: 'aesthetic' | 'savage' | 'mindful') => void;
  isPremium?: boolean;
  journalCountToday?: number;
}

export default function JournalInput({ onSubmit, isLoading, selectedPersona, onPersonaChange, isPremium = false, journalCountToday = 0 }: JournalInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = async () => {
    if (!text.trim() || isLoading) return;
    await onSubmit(text);
  };

  return (
    <div className="w-full relative">
      {/* Premium Lock Indicator */}
      <div className="absolute top-4 right-4 z-10 pointer-events-none">
        {isPremium ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50/80 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded-full border border-indigo-100 dark:border-indigo-800 backdrop-blur-sm shadow-sm">
            <span className="text-sm">⭐</span> Premium — Unlimited Journaling
          </div>
        ) : (
          <div className="inline-flex flex-col items-end gap-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full border border-slate-200 dark:border-slate-700 backdrop-blur-sm shadow-sm">
              Jurnal hari ini: <span className={journalCountToday >= 2 ? "text-amber-500" : ""}>{journalCountToday}/2</span>
            </div>
            {journalCountToday >= 2 && (
              <span className="text-[10px] text-amber-500 font-bold bg-white/80 dark:bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">Limit tercapai. Butuh Premium ⭐</span>
            )}
          </div>
        )}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Tulis aja semuanya. Overthinking soal tugas, masalah temen, atau sekadar capek hari ini..."
        className="w-full min-h-[300px] md:min-h-[400px] bg-transparent resize-none border-none focus:ring-0 text-lg md:text-xl text-slate-700 dark:text-slate-200 leading-relaxed placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none p-4"
        spellCheck="false"
      />

      {/* Bottom Action Bar */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="sticky bottom-6 left-0 right-0 mt-8 mx-auto w-fit max-w-full"
      >
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 rounded-full p-2 flex flex-col md:flex-row items-center gap-2 md:gap-4 transition-all">
          
          {/* Persona Selector */}
          <div className="flex items-center gap-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-full p-1">
            <button
              onClick={() => onPersonaChange('mindful')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedPersona === 'mindful' 
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              🌿 Mindful
            </button>
            <button
              onClick={() => onPersonaChange('savage')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedPersona === 'savage' 
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-red-500 dark:text-red-400' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              🔥 Savage
            </button>
            <button
              onClick={() => onPersonaChange('aesthetic')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedPersona === 'aesthetic' 
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-purple-600 dark:text-purple-400' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              ✨ Aesthetic
            </button>
          </div>

          {/* Main Action */}
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || isLoading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto justify-center"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Wand2 className="w-5 h-5" />
            )}
            {isLoading ? "Memproses..." : "Rapikan Pikiranku"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
