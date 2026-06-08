"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Edit2, Trash2, Check, Loader2, Sparkles, PaintBucket } from "lucide-react";
import { JournalEntry } from "@/types";
import { updateJournalEntry, deleteJournalEntry, updateJournalColor } from "@/app/actions/journal.actions";
import AiReflectionCard from "./ai-reflection-card";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface JournalDetailModalProps {
  entry: JournalEntry;
  onClose: () => void;
  onUpdate: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

const COLORS = [
  { name: 'Default', value: '' },
  { name: 'Red', value: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
  { name: 'Blue', value: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
  { name: 'Green', value: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
  { name: 'Purple', value: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' },
  { name: 'Orange', value: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' },
];

export default function JournalDetailModal({ entry, onClose, onUpdate, onDelete }: JournalDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(entry.raw_text);
  const [enhanceAI, setEnhanceAI] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showColors, setShowColors] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    const res = await updateJournalEntry(entry.id, text, enhanceAI);
    if (res.success && res.data) {
      onUpdate(res.data);
      setIsEditing(false);
    } else {
      alert(res.error || "Gagal menyimpan");
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Yakin ingin menghapus jurnal ini?")) return;
    setIsLoading(true);
    const res = await deleteJournalEntry(entry.id);
    if (res.success) {
      onDelete(entry.id);
      onClose();
    } else {
      alert(res.error || "Gagal menghapus");
    }
    setIsLoading(false);
  };

  const handleColorChange = async (colorVal: string) => {
    const res = await updateJournalColor(entry.id, colorVal);
    if (res.success) {
      onUpdate({ ...entry, bg_color: colorVal });
    }
    setShowColors(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col ${entry.bg_color || 'bg-white dark:bg-slate-900'}`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-inherit backdrop-blur-md">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Jurnal {format(new Date(entry.created_at), "dd MMM yyyy", { locale: id })}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setShowColors(!showColors)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors" title="Change Color">
                <PaintBucket className="w-5 h-5" />
              </button>
              <AnimatePresence>
                {showColors && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 flex gap-2"
                  >
                    {COLORS.map(c => (
                      <button 
                        key={c.name} onClick={() => handleColorChange(c.value)}
                        className={`w-8 h-8 rounded-full border-2 ${c.value ? c.value.split(' ')[0] : 'bg-slate-100 dark:bg-slate-700'} ${entry.bg_color === c.value ? 'border-slate-800 dark:border-slate-300' : 'border-transparent'}`}
                        title={c.name}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={() => setIsEditing(!isEditing)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors" title="Edit">
              <Edit2 className="w-5 h-5" />
            </button>
            <button onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors" title="Delete">
              <Trash2 className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors ml-2 border-l border-slate-200 dark:border-slate-700 pl-4">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8 flex-1 flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Curhatanmu</h3>
            {isEditing ? (
              <div className="space-y-4">
                <textarea 
                  value={text} onChange={e => setText(e.target.value)}
                  className="w-full h-64 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-300">
                  <input type="checkbox" checked={enhanceAI} onChange={e => setEnhanceAI(e.target.checked)} className="rounded text-blue-500" />
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  Enhance lagi dengan AI (Kuota -1)
                </label>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Batal</button>
                  <button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2 px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-50">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Simpan
                  </button>
                </div>
              </div>
            ) : (
              <div className="prose prose-slate dark:prose-invert text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {entry.raw_text}
              </div>
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Refleksi AI</h3>
            <AiReflectionCard reflection={entry.ai_reflection} persona="mindful" />
            <div className="mt-4 p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Sentiment Score: <span className="text-indigo-500 text-lg ml-1">{entry.sentiment_score}/10</span></p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
