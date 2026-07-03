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
        <div className="bg-gradient-to-br from-orange-50 to-indigo-50 dark:from-orange-500/10 dark:to-indigo-500/10 px-4 py-3 rounded-2xl border border-orange-100/50 dark:border-indigo-500/20 flex items-center gap-6 relative overflow-hidden group shadow-sm">
          
          {/* Streak Section */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="relative w-10 h-10 flex-shrink-0">
              {streak >= 3 ? (
                <img src="/assets/mascots/neko_win_streak_1781150980793.png" alt="Win Streak" className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform" />
              ) : streak === 0 ? (
                <img src="/assets/mascots/neko_lose_streak_1781150949147.png" alt="Lose Streak" className="w-full h-full object-contain drop-shadow-md opacity-90" />
              ) : (
                <span className="text-3xl flex items-center justify-center w-full h-full">🔥</span>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Streak</p>
              <p className="text-lg font-extrabold text-orange-600 dark:text-orange-400">{streak} Days</p>
            </div>
          </div>

          <div className="w-px h-10 bg-slate-200 dark:bg-slate-700/50 relative z-10"></div>

          {/* XP Section */}
          <div 
            onClick={handleTukarXP}
            className="flex flex-col items-start cursor-pointer hover:scale-105 transition-transform relative z-10 group/xp"
            title="Tukar XP dengan hadiah rahasia!"
          >
            <div className="flex justify-center items-center gap-1 mb-0.5">
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Total XP</p>
              <Sparkles className="w-3 h-3 text-indigo-500 group-hover/xp:text-amber-400 transition-colors" />
            </div>
            <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">{xp} XP</p>
          </div>
          
          {/* Background shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
        </div>

        <ShareableCanvasModal userId={userId} name={name} streak={streak} xp={xp} />
      </div>
    </div>
  );
}
