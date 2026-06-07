'use client';

import { Task } from '@/types';
import { deleteTask, toggleTaskStatus, saveSubTasks, generateTaskBreakdown, updateTaskDetails } from '@/app/actions/task.actions';
import { useState } from 'react';
import { Trash2, Wand2, CheckCircle2, Circle } from 'lucide-react';
import confetti from 'canvas-confetti';
import PomodoroTimer from '../learning/PomodoroTimer';
import { useModal } from '../providers/ModalProvider'; 
import FeedbackModal from '../feedback/FeedbackModal';
import { playSuccessSound } from '@/utils/audio';

export default function TaskCard({ task }: { task: Task }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  
  const { showModal: showGlobalModal } = useModal();
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description || '');
  
  // AI Breakdown states
  const [showAIModal, setShowAIModal] = useState(false);
  const [showAIFeedbackModal, setShowAIFeedbackModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [subTasks, setSubTasks] = useState<{ id: string; title: string; done: boolean }[]>(task.sub_tasks || []);
  const [draftSubTasks, setDraftSubTasks] = useState<{ id: string; title: string; done: boolean }[]>([]);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');

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
    const result = await generateTaskBreakdown(task.title, task.description, task.module_link);
    if (result.success && result.data) {
      const newSubTasks = result.data.map(title => ({
        id: Math.random().toString(36).substring(7),
        title,
        done: false
      }));
      setDraftSubTasks(newSubTasks);
    }
    setIsGenerating(false);
  };

  const saveDraft = async () => {
    setIsUpdating(true);
    const res = await saveSubTasks(task.id, draftSubTasks);
    if (res.success) {
      setSubTasks(draftSubTasks);
      setShowAIModal(false);
      
      // Trigger AI Feedback Modal
      setTimeout(() => setShowAIFeedbackModal(true), 500);
      
      if (task.status === 'done' && draftSubTasks.length > subTasks.length) {
         await toggleTaskStatus(task.id, 'done');
         showGlobalModal({ title: 'Status Berubah', message: 'Sub-task baru ditambahkan ke Task yang sudah selesai. Status dikembalikan ke In Progress, silakan klik Selesai lagi nanti untuk kalkulasi ulang.', type: 'info' });
      }
    }
    setIsUpdating(false);
  };

  const toggleSubTask = async (subId: string) => {
    const updated = subTasks.map(st => st.id === subId ? { ...st, done: !st.done } : st);
    setSubTasks(updated); // Optimistic UI
    await saveSubTasks(task.id, updated);
  };

  const handleAddManualSubTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubTaskTitle.trim()) return;
    
    setIsUpdating(true);
    const newSt = { id: Math.random().toString(36).substring(7), title: newSubTaskTitle.trim(), done: false };
    const updated = [...subTasks, newSt];
    
    const res = await saveSubTasks(task.id, updated);
    if (res.success) {
      setSubTasks(updated);
      setNewSubTaskTitle('');
      if (task.status === 'done') {
        await toggleTaskStatus(task.id, 'done');
        showGlobalModal({ title: 'Status Berubah', message: 'Sub-task baru ditambahkan ke Task yang sudah selesai. Status dikembalikan ke In Progress, silakan klik Selesai lagi nanti untuk kalkulasi ulang.', type: 'info' });
      }
    }
    setIsUpdating(false);
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
    if (task.status === 'done') {
      setIsEditingTask(true);
      return;
    }

    setIsUpdating(true);
    await toggleTaskStatus(task.id, task.status);
    
    // Trigger confetti since task was pending and is now being marked as done
    playSuccessSound();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    setIsUpdating(false);
  };

  const handleSaveEdit = async () => {
    setIsUpdating(true);
    await updateTaskDetails(task.id, editTitle, editDesc);
    setIsEditingTask(false);
    setIsUpdating(false);
  };

  return (
    <>
      <div className={`flex flex-col rounded-2xl border p-5 shadow-sm dark:shadow-none transition-colors ${
        task.status === 'done' ? 'border-green-200 dark:border-green-500/20 bg-green-50 dark:bg-green-500/10' : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/50'
      }`}>
        <div className="flex items-start justify-between">
          {isEditingTask ? (
            <div className="flex-1 mr-4 space-y-2">
              <input 
                value={editTitle} 
                onChange={e => setEditTitle(e.target.value)} 
                className="w-full text-lg font-bold p-2 border rounded-xl bg-slate-50 dark:bg-slate-800/50 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900" 
              />
              <textarea 
                value={editDesc} 
                onChange={e => setEditDesc(e.target.value)} 
                rows={3}
                className="w-full text-sm p-2 border rounded-xl bg-slate-50 dark:bg-slate-800/50 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 resize-none" 
              />
              <div className="flex gap-2">
                <button onClick={handleSaveEdit} className="text-xs font-bold bg-indigo-500 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 px-3 py-2 rounded-xl transition-colors disabled:opacity-50">Simpan</button>
                <button onClick={() => setIsEditingTask(false)} className="text-xs font-bold bg-slate-900 dark:bg-slate-700/50 text-slate-50 dark:text-slate-400 hover:bg-slate-800 hover:text-slate-200 px-3 py-2 rounded-xl transition-colors disabled:opacity-50">Batal</button>
              </div>
            </div>
          ) : (
            <div>
              <h4 className={`font-bold text-lg ${task.status === 'done' ? 'text-green-800 dark:text-green-400 line-through' : 'text-gray-900 dark:text-white'}`}>
                {task.title}
              </h4>
              <p className="text-sm text-indigo-500 font-medium mt-1">
                {new Date(task.scheduled_time).toLocaleString()} • {task.duration_estimate_minutes} mins
              </p>
            </div>
          )}
          <div className="flex gap-2 items-start shrink-0">
            <button 
              onClick={handleToggle} 
              disabled={isUpdating || isDeleting}
              className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-all ${
                task.status === 'done' 
                  ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200 shadow-sm dark:shadow-none' 
                  : 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 shadow-sm dark:shadow-none'
              }`}
            >
              {isUpdating ? '...' : (task.status === 'done' ? 'EDIT' : 'DONE')}
            </button>
            <button 
              onClick={handleDeleteClick}
              disabled={isDeleting || isUpdating}
              className="px-4 py-1.5 text-xs font-bold rounded-full border border-red-200 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 hover:border-red-300 shadow-sm dark:shadow-none transition-all disabled:opacity-50"
            >
              {isDeleting ? '...' : 'DELETE'}
            </button>
          </div>
        </div>
        
        {task.description && (
          <div className="mt-3">
            <div className={`text-sm whitespace-pre-wrap relative overflow-hidden transition-all duration-300 ${task.status === 'done' ? 'text-green-700' : 'text-gray-600 dark:text-slate-300'} ${!isDescExpanded && task.description.length > 150 ? 'max-h-16' : 'max-h-[1000px]'}`}>
              {task.description}
              {!isDescExpanded && task.description.length > 150 && (
                <div className={`absolute bottom-0 left-0 w-full h-8 bg-linear-to-t ${task.status === 'done' ? 'from-green-50 dark:from-green-900/20' : 'from-white dark:from-slate-900'} to-transparent`} />
              )}
            </div>
            {task.description.length > 150 && (
              <button 
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="text-xs font-bold text-indigo-500 hover:text-indigo-700 dark:text-indigo-300 mt-1 uppercase tracking-wider"
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
            className="mt-4 inline-block w-fit px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold border border-indigo-100 hover:bg-indigo-100  transition-colors"
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
                <button onClick={() => toggleSubTask(st.id)} className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 transition-colors">
                  {st.done ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5" />}
                </button>
                <span className={`text-sm font-medium ${st.done ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-slate-200'}`}>
                  {st.title}
                </span>
              </div>
            ))}
          </div>
        )}
        
        {/* Add manual subtask input */}
        <div className="mt-3">
          <form onSubmit={handleAddManualSubTask} className="flex items-center gap-2">
            <input 
              type="text" 
              value={newSubTaskTitle}
              onChange={e => setNewSubTaskTitle(e.target.value)}
              placeholder="Tambah sub-task baru..."
              className="flex-1 text-sm p-2 border rounded-xl bg-slate-50 dark:bg-slate-800/50 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900"
              disabled={isUpdating}
            />
            <button 
              type="submit" 
              disabled={!newSubTaskTitle.trim() || isUpdating}
              className="text-xs font-bold bg-slate-900 dark:bg-slate-700/50 text-slate-50 dark:text-slate-400 hover:bg-slate-800 hover:text-slate-200 px-3 py-2 rounded-xl transition-colors disabled:opacity-50"  
            >
              Add
            </button>
          </form>
        </div>

        {task.status !== 'done' && <PomodoroTimer />}

        <div className="mt-5 flex justify-end">
          <button 
            onClick={handleBreakdownClick}
            className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-500 to-indigo-500 text-white rounded-xl text-sm font-bold shadow-md dark:shadow-none hover:shadow-lg  transition-all hover:-translate-y-0.5"
          >
            <Wand2 className="w-4 h-4" />
            {subTasks.length > 0 ? 'Edit AI Breakdown' : 'Breakdown with AI'}
          </button>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900/50 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center transform transition-all animate-fade-in">
            <div className="mx-auto w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
              <Trash2 className="w-8 h-8" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2 dark:text-gray-200">
              Hapus Tugas?
            </h3>
            
            <p className="text-gray-600 dark:text-slate-300 mb-8 leading-relaxed text-sm">
              Kamu yakin mau menghapus tugas <span className="font-bold text-gray-800 dark:text-gray-200">"{task.title}"</span>? Tugas yang udah dihapus gak bisa dibalikin lagi, lho.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-2xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg dark:shadow-none shadow-red-200 transition-colors"
              >
                Ya, Hapus!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI BREAKDOWN MODAL */}
      {showAIModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900/50 rounded-3xl p-8 max-w-lg w-full shadow-2xl transform transition-all animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-indigo-600 flex items-center gap-2">
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
                    <div key={st.id} className="flex items-start gap-3 bg-white dark:bg-slate-900/50 p-3 rounded-xl border border-gray-100 shadow-sm dark:shadow-none animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                      <div className="mt-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-slate-200 font-medium leading-snug">{st.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowAIModal(false)}
                className="flex-1 py-3 rounded-2xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors disabled:opacity-50"
                disabled={isGenerating || isUpdating}
              >
                Cancel
              </button>
              <button
                onClick={generate}
                className="flex-1 py-3 rounded-2xl font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50 border border-indigo-200 hover:bg-indigo-100  transition-colors disabled:opacity-50"
                disabled={isGenerating || isUpdating}
              >
                Regenerate 🎲
              </button>
              <button
                onClick={saveDraft}
                className="flex-1 py-3 rounded-2xl font-bold text-white bg-linear-to-r from-purple-500 to-indigo-500 shadow-lg dark:shadow-none shadow-indigo-200 hover:shadow-xl  hover:-translate-y-0.5 transition-all disabled:opacity-50"
                disabled={isGenerating || isUpdating || draftSubTasks.length === 0}
              >
                {isUpdating ? 'Saving...' : 'Save ✅'}
              </button>
            </div>
          </div>
        </div>
      )}

      <FeedbackModal 
        isOpen={showAIFeedbackModal}
        onClose={() => setShowAIFeedbackModal(false)}
        type="ai_breakdown"
        title="Pecahannya Mantap Gak?"
        description={`Gimana menurut lo hasil breakdown AI buat tugas "${task.title}"?`}
        metadata={{ task_id: task.id }}
      />
    </>
  );
}
