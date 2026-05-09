'use client';

import { Task } from '@/types';
import { deleteTask, toggleTaskStatus, saveSubTasks } from '@/app/actions/task.actions';
import { generateTaskBreakdown } from '@/app/actions/ai.actions';
import { useState } from 'react';
import { Trash2, Wand2, CheckCircle2, Circle } from 'lucide-react';
import confetti from 'canvas-confetti';
import PomodoroTimer from './PomodoroTimer';

export default function TaskCard({ task }: { task: Task }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  
  // AI Breakdown states
  const [showAIModal, setShowAIModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [subTasks, setSubTasks] = useState<{ id: string; title: string; done: boolean }[]>(task.sub_tasks || []);
  const [draftSubTasks, setDraftSubTasks] = useState<{ id: string; title: string; done: boolean }[]>([]);

  const handleBreakdownClick = async () => {
    setShowAIModal(true);
    if (subTasks.length === 0) {
      await generate();
    } else {
      setDraftSubTasks(subTasks);
    }
  };

  const generate = async () => {
    setIsGenerating(true);
    const result = await generateTaskBreakdown(task.title, task.description);
    const newSubTasks = result.map(title => ({
      id: Math.random().toString(36).substring(7),
      title,
      done: false
    }));
    setDraftSubTasks(newSubTasks);
    setIsGenerating(false);
  };

  const saveDraft = async () => {
    setIsUpdating(true);
    const res = await saveSubTasks(task.id, draftSubTasks);
    if (res.success) {
      setSubTasks(draftSubTasks);
      setShowAIModal(false);
    }
    setIsUpdating(false);
  };

  const toggleSubTask = async (subId: string) => {
    const updated = subTasks.map(st => st.id === subId ? { ...st, done: !st.done } : st);
    setSubTasks(updated); // Optimistic UI
    await saveSubTasks(task.id, updated);
  };


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
    
    // Trigger confetti if task is being marked as done
    if (task.status !== 'done') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    
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
          <div className="mt-3">
            <div className={`text-sm whitespace-pre-wrap relative overflow-hidden transition-all duration-300 ${task.status === 'done' ? 'text-green-700' : 'text-gray-600'} ${!isDescExpanded && task.description.length > 150 ? 'max-h-16' : 'max-h-[1000px]'}`}>
              {task.description}
              {!isDescExpanded && task.description.length > 150 && (
                <div className={`absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t ${task.status === 'done' ? 'from-green-50' : 'from-white'} to-transparent`} />
              )}
            </div>
            {task.description.length > 150 && (
              <button 
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="text-xs font-bold text-indigo-500 hover:text-indigo-700 mt-1 uppercase tracking-wider"
              >
                {isDescExpanded ? 'Show Less' : 'Read More'}
              </button>
            )}
          </div>
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

        {/* Existing Sub Tasks */}
        {subTasks.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="h-px bg-gray-100 w-full mb-3" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sub Tasks</p>
            {subTasks.map(st => (
              <div key={st.id} className="flex items-center gap-3">
                <button onClick={() => toggleSubTask(st.id)} className="text-indigo-500 hover:text-indigo-600 transition-colors">
                  {st.done ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5" />}
                </button>
                <span className={`text-sm font-medium ${st.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                  {st.title}
                </span>
              </div>
            ))}
          </div>
        )}

        {task.status !== 'done' && <PomodoroTimer />}

        <div className="mt-5 flex justify-end">
          <button 
            onClick={handleBreakdownClick}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
          >
            <Wand2 className="w-4 h-4" />
            {subTasks.length > 0 ? 'Edit AI Breakdown' : 'Breakdown with AI'}
          </button>
        </div>
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

      {/* AI BREAKDOWN MODAL */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl transform transition-all animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center gap-2">
                <Wand2 className="w-6 h-6 text-purple-600" />
                AI Strategist
              </h3>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100 min-h-[160px]">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4 py-8">
                  <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <p className="text-sm font-medium text-gray-500 animate-pulse">
                    Mikir bentar... ngeracik sub-task yang asik 🧠✨
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-3">Suggested Breakdown:</p>
                  {draftSubTasks.map((st, i) => (
                    <div key={st.id} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                      <div className="mt-0.5 bg-indigo-100 text-indigo-600 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-sm text-gray-700 font-medium leading-snug">{st.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowAIModal(false)}
                className="flex-1 py-3 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
                disabled={isGenerating || isUpdating}
              >
                Cancel
              </button>
              <button
                onClick={generate}
                className="flex-1 py-3 rounded-2xl font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors disabled:opacity-50"
                disabled={isGenerating || isUpdating}
              >
                Regenerate 🎲
              </button>
              <button
                onClick={saveDraft}
                className="flex-1 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
                disabled={isGenerating || isUpdating || draftSubTasks.length === 0}
              >
                {isUpdating ? 'Saving...' : 'Save ✅'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
