"use client";

import { useState } from 'react';
import TaskCard from '@/components/tasks/TaskCard';
import { Task } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface OngoingTasksProps {
  tasks: Task[];
}

export default function OngoingTasks({ tasks }: OngoingTasksProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 4;
  const totalPages = Math.ceil(tasks.length / tasksPerPage);

  if (!tasks || tasks.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100">Ongoing Tasks</h2>
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 p-12 text-center bg-white dark:bg-slate-900/50">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">You're all caught up!</h3>
          <p className="text-gray-500 dark:text-slate-400 mb-6">No ongoing tasks right now. Time to chill or schedule a new one.</p>
        </div>
      </div>
    );
  }

  const startIndex = (currentPage - 1) * tasksPerPage;
  const currentTasks = tasks.slice(startIndex, startIndex + tasksPerPage);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100">Ongoing Tasks</h2>
        
        {totalPages > 1 && (
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-full px-2 py-1 shadow-sm border border-gray-200 dark:border-slate-700">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
            <span className="text-xs font-semibold text-gray-600 dark:text-slate-300 min-w-[2.5rem] text-center">
              {currentPage} / {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        )}
      </div>
      
      <div className="grid gap-4">
        {currentTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
