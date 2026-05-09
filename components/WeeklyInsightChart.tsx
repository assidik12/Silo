'use client';

import { Flame, TrendingUp, AlertCircle } from 'lucide-react';

interface DailyData {
  day: string;
  tasksDone: number;
  learningDone: number;
  isToday: boolean;
  total: number;
}

export default function WeeklyInsightChart({ data }: { data: DailyData[] }) {
  const maxVal = Math.max(...data.map(d => d.total), 1); // Avoid division by 0
  
  // Calculate if they are at risk (0 activity today)
  const todayData = data.find(d => d.isToday);
  const isAtRisk = todayData && todayData.total === 0;

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 mt-8 relative overflow-hidden group">
      {/* Decorative Background Blur */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none transition-opacity group-hover:opacity-100" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 relative z-10">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Weekly Insights <TrendingUp className="w-6 h-6 text-indigo-500" />
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Produktivitas gabungan: Tugas selesai & Modul dipelajari.
          </p>
        </div>
        
        {isAtRisk ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-center gap-3 animate-pulse shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold">Awas Streak Putus!</p>
              <p className="text-xs font-medium opacity-90">Selesaikan minimal 1 task hari ini.</p>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
            <Flame className="w-5 h-5 text-green-500 flex-shrink-0" />
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
              <div className="absolute -top-12 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-gray-900 text-white text-xs py-1.5 px-3 rounded-lg whitespace-nowrap pointer-events-none shadow-xl z-20">
                <span className="font-bold">{item.total} Total</span>
                <div className="text-gray-300 text-[10px] mt-0.5">
                  {item.tasksDone} Tasks • {item.learningDone} Learns
                </div>
              </div>

              {/* Bar Container */}
              <div className="w-full max-w-[40px] bg-gray-50 rounded-t-xl flex flex-col justify-end overflow-hidden h-48 relative border-b-2 border-indigo-100 hover:bg-gray-100 transition-colors">
                
                {item.total === 0 && (
                  <div className="absolute bottom-2 w-full text-center text-gray-300 font-bold text-xs">
                    0
                  </div>
                )}
                
                {/* Learning Bar */}
                <div 
                  className="w-full bg-indigo-300 transition-all duration-1000 ease-out flex items-center justify-center text-[10px] font-bold text-white relative"
                  style={{ height: `${learningHeight}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                </div>
                
                {/* Tasks Bar */}
                <div 
                  className="w-full bg-indigo-600 transition-all duration-1000 ease-out flex items-center justify-center text-[10px] font-bold text-white shadow-[0_-2px_10px_rgba(79,70,229,0.3)] z-10 relative"
                  style={{ height: `${taskHeight}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              </div>
              
              {/* Day Label */}
              <div className={`mt-3 text-xs sm:text-sm font-bold uppercase tracking-wider ${item.isToday ? 'text-indigo-600' : 'text-gray-400'}`}>
                {item.day}
              </div>
              
              {/* Highlight Dot for Today */}
              {item.isToday && (
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1 animate-pulse" />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-600 shadow-sm" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tasks Done</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-300 shadow-sm" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Learning Sessions</span>
        </div>
      </div>
    </div>
  );
}
