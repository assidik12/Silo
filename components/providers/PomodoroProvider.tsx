"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getRecentSentiment } from "@/app/actions/journal.actions";
import { getRecommendedPomodoro } from "@/utils/wellness";
import { useModal } from "./ModalProvider";
import FloatingPomodoro from "@/components/tasks/FloatingPomodoro";

interface PomodoroContextType {
  activeTaskId: string | null;
  activeTaskTitle: string | null;
  startPomodoro: (taskId: string, title: string) => void;
  stopPomodoro: () => void;
  sentimentScore: number;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [activeTaskTitle, setActiveTaskTitle] = useState<string | null>(null);
  const [sentimentScore, setSentimentScore] = useState<number>(5); // default neutral

  const { showModal } = useModal();

  useEffect(() => {
    async function fetchSentiment() {
      const res = await getRecentSentiment();
      if (res.success && typeof res.data === 'number') {
        setSentimentScore(res.data);
      }
    }
    fetchSentiment();
  }, []);

  const startPomodoro = (taskId: string, title: string) => {
    if (activeTaskId && activeTaskId !== taskId) {
      // Overriding a previous task
      showModal({
        title: "Task Ditimpa",
        message: `Kamu beralih dari task sebelumnya ke "${title}". Waktu fokus akan di-reset.`,
        type: "info"
      });
    }
    setActiveTaskId(taskId);
    setActiveTaskTitle(title);
  };

  const stopPomodoro = () => {
    setActiveTaskId(null);
    setActiveTaskTitle(null);
  };

  return (
    <PomodoroContext.Provider value={{ activeTaskId, activeTaskTitle, startPomodoro, stopPomodoro, sentimentScore }}>
      {children}
      {/* Render the floating widget globally if a task is active */}
      <FloatingPomodoro />
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error("usePomodoro must be used within a PomodoroProvider");
  }
  return context;
}
