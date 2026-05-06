'use client';

import { Task } from '@/types';
import { deleteTask, toggleTaskStatus } from '@/app/actions/task.actions';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';

export default function TaskCard({ task }: { task: Task }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleDeleteClick = () => {
    setShowModal(true);
  };

  const confirmDelete = async () => {
    setShowModal(false);
    setIsDeleting(true);
    await deleteTask(task.id);
  };

  const handleToggle = async () => {
    setIsUpdating(true);
    await toggleTaskStatus(task.id, task.status);
    setIsUpdating(false);
  };

  return (
    <>
      <div className={`flex flex-col rounded-2xl border p-5 shadow-sm transition-colors ${
        task.status === 'done' ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
      }`}>
        <div className="flex items-start justify-between">
          <div>
            <h4 className={`font-bold text-lg ${task.status === 'done' ? 'text-green-800 line-through' : 'text-gray-900'}`}>
              {task.title}
            </h4>
            <p className="text-sm text-indigo-500 font-medium mt-1">
              {new Date(task.scheduled_time).toLocaleString()} • {task.duration_estimate_minutes} mins
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleToggle} 
              disabled={isUpdating || isDeleting}
              className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-all ${
                task.status === 'done' 
                  ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200 shadow-sm' 
                  : 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 shadow-sm'
              }`}
            >
              {isUpdating ? '...' : (task.status === 'done' ? 'UNDO' : 'DONE')}
            </button>
            <button 
              onClick={handleDeleteClick}
              disabled={isDeleting || isUpdating}
              className="px-4 py-1.5 text-xs font-bold rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300 shadow-sm transition-all disabled:opacity-50"
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
            className="mt-4 inline-block w-fit px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100 hover:bg-indigo-100 transition-colors"
          >
            📎 Open Module
          </a>
        )}
      </div>

      {/* CONFIRMATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center transform transition-all animate-fade-in">
            <div className="mx-auto w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
              <Trash2 className="w-8 h-8" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Hapus Tugas?
            </h3>
            
            <p className="text-gray-600 mb-8 leading-relaxed text-sm">
              Kamu yakin mau menghapus tugas <span className="font-bold text-gray-800">"{task.title}"</span>? Tugas yang udah dihapus gak bisa dibalikin lagi, lho.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition-colors"
              >
                Ya, Hapus!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
