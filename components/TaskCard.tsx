'use client';

import { Task } from '@/types';
import { deleteTask, toggleTaskStatus } from '@/app/actions/task.actions';
import { useState } from 'react';

export default function TaskCard({ task }: { task: Task }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDelete = async () => {
    const confirm = window.confirm('Are you sure you want to delete this task?');
    if (!confirm) return;
    
    setIsDeleting(true);
    await deleteTask(task.id);
  };

  const handleToggle = async () => {
    setIsUpdating(true);
    await toggleTaskStatus(task.id, task.status);
    setIsUpdating(false);
  };

  return (
    <div className={`flex flex-col rounded-lg border p-4 shadow-sm transition-colors ${
      task.status === 'done' ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
    }`}>
      <div className="flex items-start justify-between">
        <div>
          <h4 className={`font-semibold ${task.status === 'done' ? 'text-green-800 line-through' : 'text-gray-900'}`}>
            {task.title}
          </h4>
          <p className="text-sm text-blue-500 font-medium mt-1">
            {new Date(task.scheduled_time).toLocaleString()} • {task.duration_estimate_minutes} mins
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleToggle} 
            disabled={isUpdating || isDeleting}
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${
              task.status === 'done' 
                ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200' 
                : 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200'
            }`}
          >
            {isUpdating ? '...' : (task.status === 'done' ? 'UNDO' : 'DONE')}
          </button>
          <button 
            onClick={handleDelete}
            disabled={isDeleting || isUpdating}
            className="px-3 py-1 text-xs font-semibold rounded-full border border-red-300 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
          >
            {isDeleting ? '...' : 'DELETE'}
          </button>
        </div>
      </div>
      
      {task.description && (
        <p className={`mt-3 text-sm whitespace-pre-wrap ${task.status === 'done' ? 'text-green-700' : 'text-gray-600'}`}>
          {task.description}
        </p>
      )}
      
      {task.module_link && (
        <a 
          href={task.module_link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-3 inline-block w-fit px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium border border-indigo-100 hover:bg-indigo-100"
        >
          📎 Open Module
        </a>
      )}
    </div>
  );
}
