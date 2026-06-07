'use client';

import { useState, useEffect } from 'react';

export default function DynamicGreeting({ name, streak }: { name: string; streak: number }) {
  const [greeting, setGreeting] = useState(`Welcome back, ${name} 👋`);

  useEffect(() => {
    const hour = new Date().getHours();
    
    // 50% chance to show streak greeting if streak is high
    if (streak >= 5 && Math.random() > 0.5) {
      setGreeting(`🔥 Streak ${streak} hari! Menyala abangkuh ${name} 🔥`);
      return;
    }

    if (hour >= 5 && hour < 11) {
      setGreeting(`Pagi-pagi udah ambis aja, ${name}! 🌅 Let's get this bread! 🍞`);
    } else if (hour >= 11 && hour < 15) {
      setGreeting(`Tetap grind walau ngantuk, ${name}! ☕ Jangan lupa makan siangnya 🍱`);
    } else if (hour >= 15 && hour < 19) {
      setGreeting(`Sore yang produktif, ${name}! 🌇 Gas terus jangan kasih kendor 🚀`);
    } else if (hour >= 19 && hour < 23) {
      setGreeting(`Malam produktif mode: ON 💻 Semangat nge-push rank-nya, ${name}! 🎮`);
    } else {
      setGreeting(`Midnight oil burning, ${name}? 🦉 Jangan lupa tidur bre 💀`);
    }
  }, [name, streak]);

  return (
    <p className="text-sm font-medium text-gray-600 dark:text-slate-300 mt-1 transition-opacity duration-500">
      {greeting}
    </p>
  );
}
