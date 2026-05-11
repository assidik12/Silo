"use client";

import { useState, useCallback } from "react";
import { Task, ActionResponse } from "@/types";
import { getTasks, deleteTask, toggleTaskStatus, createTask } from "@/app/actions/task.actions";

/**
 * Custom hook to manage tasks state and operations.
 * Centralizes CRUD logic for cleaner components.
 */
export function useTasks(initialTasks: Task[] = []) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch tasks");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeTask = async (taskId: string) => {
    const res = await deleteTask(taskId);
    if (res.success) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    }
    return res;
  };

  const toggleStatus = async (taskId: string, currentStatus: "pending" | "done") => {
    const res = await toggleTaskStatus(taskId, currentStatus);
    if (res.success) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, status: currentStatus === "pending" ? "done" : "pending" } : t
        )
      );
    }
    return res;
  };

  return {
    tasks,
    isLoading,
    error,
    fetchTasks,
    removeTask,
    toggleStatus,
    setTasks
  };
}
