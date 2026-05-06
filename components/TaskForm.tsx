'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTask } from '@/app/actions/task.actions';
import { CheckCircle2, XCircle, Sparkles } from 'lucide-react';

export default function TaskForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean, type: 'success' | 'error', message: string }>({
    isOpen: false,
    type: 'success',
    message: ''
  });

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    
    const result = await createTask(formData);
    
    if (!result.success) {
      setModal({ 
        isOpen: true, 
        type: 'error', 
        message: result.error || 'Terjadi kesalahan saat membuat tugas.' 
      });
    } else {
      formRef.current?.reset();
      setModal({ 
        isOpen: true, 
        type: 'success', 
        message: 'Task berhasil dibuat dan disinkronkan ke Google Calendar!' 
      });
    }
    setLoading(false);
  };

  const closeModal = () => {
    const isSuccess = modal.type === 'success';
    setModal({ ...modal, isOpen: false });
    
    if (isSuccess) {
      router.push('/dashboard');
    }
  };

  return (
    <>
      <div className="w-full">
        <form ref={formRef} action={handleSubmit} className="space-y-6">
          
          <div>
            <label htmlFor="title" className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Task Title</label>
            <input
              type="text"
              name="title"
              id="title"
              required
              className="block w-full rounded-2xl border-none bg-slate-100/80 px-5 py-4 text-slate-700 font-semibold placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all shadow-sm"
              placeholder="E.g., Bikin PPT Presentasi"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
              Description <span className="text-slate-400 font-medium normal-case">(Opsional)</span>
            </label>
            <textarea
              name="description"
              id="description"
              rows={3}
              className="block w-full rounded-2xl border-none bg-slate-100/80 px-5 py-4 text-slate-700 font-medium placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all shadow-sm resize-none"
              placeholder="Catatan kecil buat task ini..."
            />
          </div>

          <div>
            <label htmlFor="module_link" className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
              Module Link <span className="text-slate-400 font-medium normal-case">(Opsional)</span>
            </label>
            <input
              type="url"
              name="module_link"
              id="module_link"
              className="block w-full rounded-2xl border-none bg-slate-100/80 px-5 py-4 text-slate-700 font-medium placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all shadow-sm"
              placeholder="https://drive.google.com/..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="scheduled_time" className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Scheduled Time</label>
              <input
                type="datetime-local"
                name="scheduled_time"
                id="scheduled_time"
                required
                className="block w-full rounded-2xl border-none bg-slate-100/80 px-5 py-4 text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="duration_estimate_minutes" className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Duration (Mins)</label>
              <input
                type="number"
                name="duration_estimate_minutes"
                id="duration_estimate_minutes"
                min="1"
                required
                className="block w-full rounded-2xl border-none bg-slate-100/80 px-5 py-4 text-slate-700 font-semibold placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all shadow-sm"
                placeholder="60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center items-center gap-3 rounded-2xl bg-indigo-600 px-6 py-4 mt-4 text-lg font-bold text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 animate-spin-slow" />
                Lagi masukin ke kalender...
              </span>
            ) : (
              <>
                <Sparkles className="w-5 h-5 group-hover:scale-125 transition-transform" />
                Bikin Tugas Sekarang!
              </>
            )}
          </button>
        </form>
      </div>

      {/* MODAL POP-UP */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center transform scale-100 transition-all">
            {modal.type === 'success' ? (
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            )}
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {modal.type === 'success' ? 'Berhasil!' : 'Oops, Gagal!'}
            </h3>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              {modal.message}
            </p>
            
            <button
              onClick={closeModal}
              className={`w-full py-3.5 rounded-2xl font-bold text-white transition-colors ${
                modal.type === 'success' 
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 shadow-lg' 
                  : 'bg-gray-800 hover:bg-gray-900 shadow-gray-300 shadow-lg'
              }`}
            >
              OK, Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
