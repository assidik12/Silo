'use client';

import ShareableCanvasModal from './ShareableCanvasModal';
import { useModal } from "@/components/providers/ModalProvider";
import { Sparkles } from "lucide-react";

export default function GamificationStats({ userId, name, streak, xp }: { userId: string; name: string; streak: number; xp: number }) {
  const { showModal } = useModal();

  const handleTukarXP = () => {
    showModal({
      title: "Secret Feature 🤫",
      message: "Kumpulin XP yang banyak! Sebentar lagi kamu bisa menukarkan XP kamu dengan fitur istimewa yang masih dirahasiakan. Stay tuned ya!",
      type: "info"
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">

      <div className="flex items-center gap-4">
        <div className="bg-orange-50 dark:bg-orange-500/10 px-4 py-3 rounded-2xl border border-orange-100 flex items-center gap-3">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">Streak</p>
            <p className="text-xl font-extrabold text-orange-600 dark:text-orange-400">{streak} Days</p>
          </div>
        </div>

        <button 
          onClick={handleTukarXP}
          className="bg-indigo-50 dark:bg-indigo-900/30 px-6 py-3 rounded-2xl shadow-sm dark:shadow-none border-2 border-indigo-200 dark:border-indigo-500/30 text-center min-w-32 hover:scale-105 transition-transform hover:border-indigo-400 relative overflow-hidden group cursor-pointer"
          title="Tukar XP dengan hadiah rahasia!"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
          
          <div className="flex justify-center items-center gap-1 mb-1 relative z-10">
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Total XP</p>
            <Sparkles className="w-3 h-3 text-indigo-500" />
          </div>
          <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 relative z-10">{xp} XP</p>
          <div className="text-[9px] mt-1 text-indigo-500/70 font-bold uppercase tracking-widest group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors relative z-10">Tukar XP (Coming Soon)</div>
        </button>

        <ShareableCanvasModal userId={userId} name={name} streak={streak} xp={xp} />
      </div>
    </div>
  );
}
