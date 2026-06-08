"use client";

import { getAffirmationCategory } from "@/utils/wellness";
import { JournalEntry } from "@/types";

interface MentalEnergyWidgetProps {
  recentEntries: JournalEntry[];
}

export default function MentalEnergyWidget({ recentEntries }: MentalEnergyWidgetProps) {
  // If no entries, we default to score 5 (Netral)
  const latestScore = recentEntries.length > 0 ? recentEntries[0].sentiment_score : 5;
  const { category, affirmation, color } = getAffirmationCategory(latestScore);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-slate-800 flex flex-col h-full justify-center">
      <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-2">
        Mental Energy Tracker
      </h3>

      <div className="flex items-baseline gap-2 mb-2">
        <span className={`text-3xl font-black ${color}`}>{category}</span>
        {recentEntries.length > 0 && (
          <span className="text-sm font-semibold text-slate-400">Score: {latestScore}/10</span>
        )}
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
        "{affirmation}"
      </p>
    </div>
  );
}
