'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Sparkles, Target, BookOpen, MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DailyCheckinModal() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if the user has already seen the modal today
    const today = new Date().toISOString().split('T')[0];
    const lastCheckin = localStorage.getItem('dojo_daily_checkin');

    if (lastCheckin !== today) {
      // Small delay to let the page load first
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSelection = (action: string) => {
    // Save to local storage so it doesn't show again today
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('dojo_daily_checkin', today);
    setIsOpen(false);

    if (action === 'task') router.push('/dashboard/task');
    if (action === 'learn') router.push('/dashboard/learning');
    if (action === 'journal') router.push('/dashboard/journal');
    // if 'skip', just close the modal
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden max-w-lg w-full relative"
          >
            {/* Background Pattern */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-10"></div>
            
            <button 
              onClick={() => handleSelection('skip')}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white bg-gray-100 dark:bg-slate-800 rounded-full p-2 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 pt-10 text-center relative z-10">
              <div className="mx-auto w-20 h-20 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-6">
                <Brain className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
              </div>
              
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 flex justify-center items-center gap-2">
                Halo! Hari ini mau apa? <Sparkles className="w-6 h-6 text-yellow-500" />
              </h2>
              <p className="text-gray-500 dark:text-slate-400 mb-8">
                DoJo siap bantu kamu nge-grind hari ini. Pilih fokus utamamu supaya kita bisa langsung gass!
              </p>

              <div className="grid gap-3">
                <button 
                  onClick={() => handleSelection('task')}
                  className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all text-left group"
                >
                  <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Beresin Tugas</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Kerjain PR, Makalah, atau Codingan</p>
                  </div>
                </button>

                <button 
                  onClick={() => handleSelection('learn')}
                  className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all text-left group"
                >
                  <div className="bg-emerald-100 dark:bg-emerald-900/50 p-3 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Belajar Materi Baru</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Review materi pakai SKS / Binge-Watch</p>
                  </div>
                </button>

                <button 
                  onClick={() => handleSelection('journal')}
                  className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 dark:border-slate-800 hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-500/10 transition-all text-left group"
                >
                  <div className="bg-pink-100 dark:bg-pink-900/50 p-3 rounded-xl text-pink-600 dark:text-pink-400 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Curhat & Jurnal</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Catat mental energy dan evaluasi hari ini</p>
                  </div>
                </button>
              </div>

              <button 
                onClick={() => handleSelection('skip')}
                className="mt-6 text-sm font-semibold text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
              >
                Cuma mau ngecek dashboard aja (Skip)
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
