'use client';

import { useState } from 'react';
import { MessageSquareHeart, Send, Sparkles } from 'lucide-react';

export default function FeedbackPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Fake loading delay
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      
      // Reset after 3 seconds
      setTimeout(() => setSubmitted(false), 3000);
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <header className="text-center mb-10">
        <div className="w-16 h-16 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-pink-50">
          <MessageSquareHeart className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Bantu DoJo Jadi Lebih Baik!</h1>
        <p className="text-slate-500 mt-2">
          Punya ide fitur baru? Nemu bug? Atau sekadar mau bilang halo? Kirim aja ke sini!
        </p>
      </header>

      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40">
        {submitted ? (
          <div className="text-center py-10 animate-fade-in">
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Makasih Banget!</h3>
            <p className="text-slate-500">Feedback lo udah masuk. Kita bakal baca dan jadiin DoJo makin keren buat lo.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="category" className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Kategori</label>
              <select
                id="category"
                className="block w-full rounded-2xl border-none bg-slate-100/80 px-5 py-4 text-slate-700 font-semibold focus:bg-white focus:outline-none focus:ring-4 focus:ring-pink-100 transition-all shadow-sm cursor-pointer"
              >
                <option value="idea">💡 Ide Fitur Baru</option>
                <option value="bug">🐛 Lapor Bug</option>
                <option value="love">❤️ Kasih Pujian</option>
                <option value="other">🤔 Lainnya</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Pesan Lo</label>
              <textarea
                id="message"
                required
                rows={5}
                className="block w-full rounded-2xl border-none bg-slate-100/80 px-5 py-4 text-slate-700 font-medium placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-pink-100 transition-all shadow-sm resize-none"
                placeholder="Ceritain detailnya di sini ya..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex w-full justify-center items-center gap-3 rounded-2xl bg-pink-500 px-6 py-4 mt-4 text-lg font-bold text-white shadow-xl shadow-pink-200 hover:bg-pink-600 hover:-translate-y-1 transition-all focus:outline-none focus:ring-4 focus:ring-pink-200 disabled:opacity-50 disabled:hover:translate-y-0"
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
