'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTask } from '@/app/actions/task.actions';
import { CheckCircle2, XCircle } from 'lucide-react';

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
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-medium text-gray-900">Add New Task</h3>
        
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Task Title</label>
            <input
              type="text"
              name="title"
              id="title"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 text-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              placeholder="Study Calculus"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
            <textarea
              name="description"
              id="description"
              rows={2}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-gray-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              placeholder="Details about the task..."
            />
          </div>

          <div>
            <label htmlFor="module_link" className="block text-sm font-medium text-gray-700">Module Link (Google Drive)</label>
            <input
              type="url"
              name="module_link"
              id="module_link"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-gray-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              placeholder="https://drive.google.com/..."
            />
          </div>

          <div>
            <label htmlFor="scheduled_time" className="block text-sm font-medium text-gray-700">Scheduled Time</label>
            <input
              type="datetime-local"
              name="scheduled_time"
              id="scheduled_time"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-gray-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="duration_estimate_minutes" className="block text-sm font-medium text-gray-700">Duration Estimate (Minutes)</label>
            <input
              type="number"
              name="duration_estimate_minutes"
              id="duration_estimate_minutes"
              min="1"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-gray-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              placeholder="60"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Create Task'}
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
