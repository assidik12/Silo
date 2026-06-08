"use client";

import { motion } from "framer-motion";
import { Sparkles, Leaf, Flame } from "lucide-react";

interface AiReflectionCardProps {
  reflection: string;
  persona: 'aesthetic' | 'savage' | 'mindful';
}

export default function AiReflectionCard({ reflection, persona }: AiReflectionCardProps) {
  
  const getPersonaStyles = () => {
    switch (persona) {
      case 'aesthetic':
        return {
          bg: "bg-purple-50/50 dark:bg-purple-900/10",
          border: "border-purple-200 dark:border-purple-800",
          text: "text-purple-800 dark:text-purple-200",
          icon: <Sparkles className="w-5 h-5 text-purple-500" />,
          title: "Aesthetic Notes ✨"
        };
      case 'savage':
        return {
          bg: "bg-red-50/50 dark:bg-red-900/10",
          border: "border-red-200 dark:border-red-800",
          text: "text-red-800 dark:text-red-200",
          icon: <Flame className="w-5 h-5 text-red-500" />,
          title: "Savage Truth 🔥"
        };
      case 'mindful':
      default:
        return {
          bg: "bg-emerald-50/50 dark:bg-emerald-900/10",
          border: "border-emerald-200 dark:border-emerald-800",
          text: "text-emerald-800 dark:text-emerald-200",
          icon: <Leaf className="w-5 h-5 text-emerald-500" />,
          title: "Mindful Reflection 🌿"
        };
    }
  };

  const styles = getPersonaStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`mt-8 p-6 md:p-8 rounded-3xl border shadow-sm backdrop-blur-md ${styles.bg} ${styles.border}`}
    >
      <div className="flex items-center gap-3 mb-4">
        {styles.icon}
        <h3 className={`font-bold text-lg ${styles.text}`}>
          {styles.title}
        </h3>
      </div>
      <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
        {reflection}
      </div>
    </motion.div>
  );
}
