'use client';

import ShareableCanvasModal from './ShareableCanvasModal';

export default function GamificationStats({ userId, name, streak, xp }: { userId: string; name: string; streak: number; xp: number }) {
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

        <div className="bg-white dark:bg-slate-900/50 px-6 py-3 rounded-2xl shadow-sm dark:shadow-none border border-gray-200 text-center min-w-32">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Your Score</p>
          <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{xp} XP</p>
        </div>

        <ShareableCanvasModal userId={userId} name={name} streak={streak} xp={xp} />
      </div>
    </div>
  );
}
