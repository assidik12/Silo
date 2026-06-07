"use client";

import { useState, useEffect } from 'react';
import { fetchCalendarEvents } from '@/app/actions/calendar.actions';
import { Calendar, Clock, Loader2, Palette } from 'lucide-react';

const THEMES = {
  minimalist: "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-gray-100",
  cyberpunk: "bg-gray-900 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)] text-pink-500 font-mono",
  retro: "bg-orange-50 border-orange-400 border-4 rounded-none text-orange-900 font-serif",
  pastel: "bg-pink-50 border-pink-200 shadow-sm text-pink-700 rounded-3xl"
};

const EVENT_COLORS = {
  minimalist: "bg-gray-50 dark:bg-slate-800/50 text-gray-800 dark:text-gray-200 border-l-4 border-indigo-500 rounded-r-lg",
  cyberpunk: "bg-black border border-cyan-400 text-green-400 shadow-[inset_0_0_10px_rgba(74,222,128,0.2)]",
  retro: "bg-orange-200 border-b-4 border-r-4 border-orange-500 text-orange-900",
  pastel: "bg-white border-2 border-pink-100 text-pink-600 rounded-2xl shadow-sm"
};

export default function InlineCalendar() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState<keyof typeof THEMES>('minimalist');

  useEffect(() => {
    async function loadEvents() {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      
      const res = await fetchCalendarEvents(now.toISOString(), endOfDay.toISOString());
      if (res.success) {
        setEvents(res.data || []);
      } else {
        setError(res.error || "Failed to load events");
      }
      setLoading(false);
    }
    loadEvents();
  }, []);

  const themeClasses = THEMES[theme];
  const eventClasses = EVENT_COLORS[theme];

  return (
    <div className={`p-6 rounded-2xl border transition-all duration-500 ${themeClasses}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Today's Schedule
        </h2>
        <div className="flex items-center gap-2 text-sm">
          <Palette className="w-4 h-4 opacity-70" />
          <select 
            value={theme}
            onChange={(e) => setTheme(e.target.value as any)}
            className="bg-transparent border-none outline-none font-medium cursor-pointer opacity-80 hover:opacity-100"
          >
            <option value="minimalist" className="text-black">Minimalist</option>
            <option value="cyberpunk" className="text-black">Cyberpunk</option>
            <option value="retro" className="text-black">Retro</option>
            <option value="pastel" className="text-black">Pastel</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin opacity-50" />
        </div>
      ) : error ? (
        <div className="text-sm opacity-80 text-center py-4 bg-red-500/10 text-red-500 rounded-lg flex flex-col items-center gap-2">
          <span>{error}</span>
          {error.includes("log in") && (
            <button 
              onClick={() => window.location.href = '/login'}
              className="mt-2 px-4 py-1.5 bg-red-500 text-white rounded-md text-xs font-semibold hover:bg-red-600 transition-colors"
            >
              Reconnect Google
            </button>
          )}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-8 opacity-70 italic border-2 border-dashed border-current/20 rounded-xl">
          No events scheduled for today. You're free!
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((ev, i) => {
            const start = ev.start?.dateTime ? new Date(ev.start.dateTime) : null;
            const end = ev.end?.dateTime ? new Date(ev.end.dateTime) : null;
            
            const timeStr = start && end 
              ? `${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
              : 'All Day';

            return (
              <div key={ev.id || i} className={`p-4 transition-all ${eventClasses}`}>
                <div className="font-semibold">{ev.summary}</div>
                <div className="text-sm opacity-80 flex items-center gap-1.5 mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  {timeStr}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
