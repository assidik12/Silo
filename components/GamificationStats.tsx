'use client';

export default function GamificationStats({ streak, xp }: { streak: number; xp: number }) {
  return (
    <div className="flex items-center gap-4">
      <div className="bg-orange-50 px-4 py-3 rounded-2xl border border-orange-100 flex items-center gap-3">
        <span className="text-2xl">🔥</span>
        <div>
          <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">Streak</p>
          <p className="text-xl font-extrabold text-orange-600">{streak} Days</p>
        </div>
      </div>
      
      <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-200 text-center min-w-32">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Your Score</p>
        <p className="text-2xl font-extrabold text-indigo-600">{xp} XP</p>
      </div>
    </div>
  );
}
