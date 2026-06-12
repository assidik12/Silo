'use client';

import { useState } from 'react';
import { MessageSquareHeart, Send, Sparkles } from 'lucide-react';
import { sendFeedback } from '@/app/actions/feedback.actions';
import { useModal } from '@/components/providers/ModalProvider';

export default function FeedbackPage() {
  const { showModal } = useModal();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    category: 'idea' as 'idea' | 'bug' | 'love' | 'other',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const res = await sendFeedback({
      type: 'general',
      category: formData.category === 'other' ? undefined : formData.category,
      message: formData.message
    });

    if (res.success) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
      setFormData({ category: 'idea', message: '' });
    } else {
      showModal({
        title: 'Gagal Kirim',
        message: res.error || 'Ada masalah pas kirim feedback. Coba lagi ya!',
        type: 'error'
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <header className="text-center mb-10">
        <div className="w-16 h-16 bg-pink-100 dark:bg-pink-500/10 text-pink-500 dark:text-pink-400 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-pink-50 dark:ring-pink-500/5">
          <MessageSquareHeart className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Bantu Silo Jadi Lebih Baik!</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Punya ide fitur baru? Nemu bug? Atau sekadar mau bilang halo? Kirim aja ke sini!
        </p>
      </header>

      <div className="bg-white dark:bg-slate-900/50 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-xl dark:shadow-none shadow-slate-200/40">
        {submitted ? (
          <div className="text-center py-10 animate-fade-in">
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Makasih Banget!</h3>
            <p className="text-slate-500 dark:text-slate-400">Feedback lo udah masuk. Kita bakal baca dan jadiin Silo makin keren buat lo.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="category" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Kategori</label>
              <select
                id="category"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as any})}
                className="block w-full rounded-2xl border-none bg-slate-100 dark:bg-slate-800/80 px-5 py-4 text-slate-700 dark:text-slate-200 font-semibold focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-pink-100 dark:focus:ring-pink-900/50 transition-all shadow-sm dark:shadow-none cursor-pointer"
              >
                <option value="idea">💡 Ide Fitur Baru</option>
                <option value="bug">🐛 Lapor Bug</option>
                <option value="love">❤️ Kasih Pujian</option>
                <option value="other">🤔 Lainnya</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Pesan Lo</label>
              <textarea
                id="message"
                required
                rows={5}
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                className="block w-full rounded-2xl border-none bg-slate-100 dark:bg-slate-800/80 px-5 py-4 text-slate-700 dark:text-slate-200 font-medium placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-pink-100 dark:focus:ring-pink-900/50 transition-all shadow-sm dark:shadow-none resize-none"
                placeholder="Ceritain detailnya di sini ya..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex w-full justify-center items-center gap-3 rounded-2xl bg-pink-500 px-6 py-4 mt-4 text-lg font-bold text-white shadow-xl dark:shadow-none shadow-pink-200 hover:bg-pink-600 hover:-translate-y-1 transition-all focus:outline-none focus:ring-4 focus:ring-pink-200 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 animate-spin-slow" />
                  Mengirim...
                </span>
              ) : (
                <>
                  Kirim Feedback <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
