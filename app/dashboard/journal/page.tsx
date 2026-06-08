"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import JournalInput from "@/components/wellness/journal-input";
import AiReflectionCard from "@/components/wellness/ai-reflection-card";
import { createJournalEntry, getJournalEntries } from "@/app/actions/journal.actions";
import { X, Plus, Calendar } from "lucide-react";
import Link from "next/link";
import { JournalEntry } from "@/types";
import JournalDetailModal from "@/components/wellness/journal-detail-modal";

export default function JournalPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [persona, setPersona] = useState<'aesthetic' | 'savage' | 'mindful'>('mindful');
  const [error, setError] = useState<string | null>(null);
  const [reflectionData, setReflectionData] = useState<JournalEntry | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  const today = format(new Date(), "EEEE, d MMMM", { locale: id });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setIsFetching(true);
    const res = await getJournalEntries();
    if (res.success && res.data) {
      setEntries(res.data);
    }
    setIsFetching(false);
  };

  const getBgGlow = () => {
    if (!isCreating) return 'bg-transparent';
    switch (persona) {
      case 'aesthetic': return 'bg-purple-500/5';
      case 'savage': return 'bg-red-500/5';
      case 'mindful': 
      default: return 'bg-emerald-500/5';
    }
  };

  const handleJournalSubmit = async (text: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await createJournalEntry(text, persona);
      if (res.success && res.data) {
        setReflectionData(res.data);
        // Add to entries
        setEntries([res.data, ...entries]);
      } else {
        setError(res.error || "Gagal memproses jurnal.");
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseCreate = () => {
    setIsCreating(false);
    setReflectionData(null);
    setError(null);
  };

  return (
    <div className={`min-h-[calc(100vh-80px)] md:min-h-screen p-4 md:p-8 transition-colors duration-1000 ${getBgGlow()}`}>
      <div className="max-w-6xl mx-auto flex flex-col h-full">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {today} 🌤️
            </p>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white">
              {isCreating ? "What's on your mind?" : "Journal History"}
            </h1>
          </div>
          {isCreating ? (
            <button onClick={handleCloseCreate} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
              <X className="w-6 h-6" />
            </button>
          ) : (
            <Link href="/dashboard" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
              <X className="w-6 h-6" />
            </Link>
          )}
        </header>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-semibold border border-red-100">
            {error}
          </div>
        )}

        {!isCreating ? (
          /* List of Cards View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create New Card */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCreating(true)}
              className="cursor-pointer min-h-[200px] border-2 border-dashed border-indigo-200 dark:border-indigo-900/50 rounded-3xl bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex flex-col items-center justify-center text-indigo-500"
            >
              <div className="bg-indigo-100 dark:bg-indigo-800/50 p-4 rounded-full mb-4">
                <Plus className="w-8 h-8" />
              </div>
              <p className="font-bold">Buat Jurnal Baru</p>
              <p className="text-sm opacity-70 mt-1">Luapkan pikiranmu hari ini</p>
            </motion.div>

            {/* Past Entries */}
            {isFetching ? (
              <div className="col-span-full py-10 text-center text-slate-500">Loading entries...</div>
            ) : (
              entries.map(entry => {
                const bgClasses = entry.bg_color || "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800";
                return (
                  <motion.div 
                    key={entry.id} 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedEntry(entry)}
                    className={`rounded-3xl p-6 border shadow-sm flex flex-col cursor-pointer transition-colors ${bgClasses}`}
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-4">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(entry.created_at), "dd MMM yyyy, HH:mm", { locale: id })}
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 line-clamp-3 mb-4 flex-1">
                      {entry.raw_text}
                    </p>
                    <div className="pt-4 border-t border-slate-100/50 dark:border-slate-800/50">
                      <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        Score: {entry.sentiment_score}/10
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        ) : (
          /* Canvas & Reflection View */
          <div className="flex-1 flex flex-col xl:flex-row gap-8">
            {/* Editor Area */}
            <div className={`flex-1 transition-all duration-500 ${reflectionData ? 'xl:w-1/2' : 'w-full'}`}>
              <JournalInput 
                onSubmit={handleJournalSubmit} 
                isLoading={isLoading} 
                selectedPersona={persona}
                onPersonaChange={setPersona}
              />
            </div>

            {/* AI Result Area */}
            <AnimatePresence>
              {reflectionData && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="xl:w-1/2 w-full"
                >
                  <AiReflectionCard 
                    reflection={reflectionData.ai_reflection} 
                    persona={persona} 
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <AnimatePresence>
          {selectedEntry && (
            <JournalDetailModal 
              entry={selectedEntry} 
              onClose={() => setSelectedEntry(null)} 
              onUpdate={(updated) => {
                setEntries(entries.map(e => e.id === updated.id ? updated : e));
                setSelectedEntry(updated);
              }}
              onDelete={(id) => {
                setEntries(entries.filter(e => e.id !== id));
              }}
            />
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
