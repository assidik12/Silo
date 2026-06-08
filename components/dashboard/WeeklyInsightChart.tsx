'use client';

import { Flame, TrendingUp, AlertCircle } from 'lucide-react';

import { useState, useEffect, useMemo } from 'react';

interface DailyData {
  day: string;
  tasksDone: number;
  learningDone: number;
  isToday: boolean;
  total: number;
}

export default function WeeklyInsightChart({ 
  recentTasks, 
  recentLearning,
  recentJournals
}: { 
  recentTasks: any[], 
  recentLearning: any[],
  recentJournals?: any[]
}) {
  const data = useMemo(() => {
    const now = new Date();
    const past7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    return past7Days.map(date => {
      const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
      const isToday = date.toDateString() === now.toDateString();
      
      const tasksDone = recentTasks?.filter(t => t.status === 'done' && new Date(t.scheduled_time).toDateString() === date.toDateString()).length || 0;
      const learningDone = recentLearning?.filter(l => new Date(l.created_at).toDateString() === date.toDateString()).length || 0;
      const journalsThatDay = recentJournals?.filter(j => new Date(j.created_at).toDateString() === date.toDateString()) || [];
      const sentimentScore = journalsThatDay.length > 0
        ? Math.round(journalsThatDay.reduce((acc, curr) => acc + curr.sentiment_score, 0) / journalsThatDay.length)
        : null;

      return {
        day: dayName,
        tasksDone,
        learningDone,
        sentimentScore,
        total: tasksDone + learningDone,
        isToday
      };
    });
  }, [recentTasks, recentLearning, recentJournals]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const maxVal = Math.max(...data.map(d => d.total), 1); // Avoid division by 0
  
  // Calculate if they are at risk (0 activity today)
  const todayData = data.find(d => d.isToday);
  const isAtRisk = todayData && todayData.total === 0;

  if (!mounted) return null; // Avoid hydration mismatch on timezone differences

  return (
    <div className="bg-white dark:bg-slate-900/50 p-6 md:p-8 rounded-3xl shadow-sm dark:shadow-none border border-gray-100 mt-8 relative overflow-hidden group dark:border-slate-800">
      {/* Decorative Background Blur */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-50 dark:bg-indigo-500/10 rounded-full blur-3xl opacity-50 pointer-events-none transition-opacity group-hover:opacity-100" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 relative z-10">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Weekly Insights <TrendingUp className="w-6 h-6 text-indigo-500" />
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Produktivitas gabungan: Tugas selesai & Modul dipelajari.
          </p>
        </div>
        
        {isAtRisk ? (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-2xl flex items-center gap-3 animate-pulse shadow-sm dark:shadow-none">
            <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold">Awas Streak Putus!</p>
              <p className="text-xs font-medium opacity-90">Selesaikan minimal 1 task hari ini.</p>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-sm dark:shadow-none">
            <Flame className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold">Produktivitas Aman 🔥</p>
              <p className="text-xs font-medium opacity-90">Pertahankan terus momentummu!</p>
            </div>
          </div>
        )}
      </div>

      <div className="relative h-64 w-full flex items-end justify-between gap-2 sm:gap-4 z-10">
        {data.map((item, i) => {
          const taskHeight = (item.tasksDone / maxVal) * 100;
          const learningHeight = (item.learningDone / maxVal) * 100;
          
          return (
            <div key={i} className="flex flex-col items-center flex-1 group/bar relative cursor-pointer">
              
              {/* Tooltip on Hover */}
              <div className="absolute -top-12 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-gray-900 text-white text-xs py-1.5 px-3 rounded-lg whitespace-nowrap pointer-events-none shadow-xl dark:shadow-none z-20">
                <span className="font-bold">{item.total} Total</span>
                <div className="text-gray-300 text-[10px] mt-0.5">
                  {item.tasksDone} Tasks • {item.learningDone} Learns
                </div>
              </div>

              {/* Bar Container */}
              <div className="w-full max-w-[40px] bg-gray-50 dark:bg-slate-800/50 rounded-t-xl flex flex-col justify-end overflow-hidden h-48 relative border-b-2 border-indigo-100 dark:border-indigo-900/50 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors">
                
                {item.total === 0 && (
                  <div className="absolute bottom-2 w-full text-center text-gray-400 dark:text-gray-500 font-bold text-xs">
                    0
                  </div>
                )}
                
                {/* Learning Bar */}
                <div 
                  className="w-full bg-indigo-300 transition-all duration-1000 ease-out flex items-center justify-center text-[10px] font-bold text-white relative"
                  style={{ height: `${learningHeight}%` }}
                >
                  <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent" />
                </div>
                
                {/* Tasks Bar */}
                <div 
                  className="w-full bg-indigo-600 transition-all duration-1000 ease-out flex items-center justify-center text-[10px] font-bold text-white shadow-[0_-2px_10px_rgba(79,70,229,0.3)] z-10 relative"
                  style={{ height: `${taskHeight}%` }}
                >
                  <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
                </div>
              </div>
              
              {/* Day Label */}
              <div className={`mt-3 text-xs sm:text-sm font-bold uppercase tracking-wider ${item.isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
                {item.day}
              </div>
              
              {/* Highlight Dot for Today */}
              {item.isToday && (
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1 animate-pulse" />
              )}
            </div>
          );
        })}
        
        {/* Draw SVG Line connecting the dots */}
        <div className="absolute top-0 left-0 w-full h-48 pointer-events-none z-20 overflow-visible">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline 
              fill="none" 
              stroke="#f59e0b" // amber-500
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
              points={data.map((d, i) => {
                if (d.sentimentScore === null) return '';
                const xPercent = ((i + 0.5) / 7) * 100;
                return `${xPercent},${100 - (d.sentimentScore * 10)}`;
              }).filter(Boolean).join(' ')}
            />
            {data.map((d, i) => {
              if (d.sentimentScore === null) return null;
              const xPercent = ((i + 0.5) / 7) * 100;
              const yPercent = 100 - (d.sentimentScore * 10);
              return (
                <circle 
                  key={i}
                  cx={xPercent} 
                  cy={yPercent} 
                  r="3" 
                  fill="#f59e0b" 
                  vectorEffect="non-scaling-stroke"
                  className="drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                />
              );
            })}
          </svg>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-600 shadow-sm dark:shadow-none" />
          <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">Tasks Done</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-300 shadow-sm dark:shadow-none" />
          <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">Learning Sessions</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
          <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">Mood Level</span>
        </div>
      </div>
    </div>
  );
}
