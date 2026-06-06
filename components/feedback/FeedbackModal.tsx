'use client';

import { useState } from 'react';
import { Star, X, Sparkles } from 'lucide-react';
import { sendFeedback } from '@/app/actions/feedback.actions';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'ai_breakdown' | 'ai_tutor' | 'milestone';
  title: string;
  description: string;
  metadata?: Record<string, any>;
}

export default function FeedbackModal({ isOpen, onClose, type, title, description, metadata }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    
    const res = await sendFeedback({
      type,
      rating,
      message,
      metadata
    });

    if (res.success) {
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setRating(0);
        setMessage('');
      }, 3000);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900/50 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:text-slate-300 transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 pt-12">
          {submitted ? (
            <div className="text-center py-8 animate-slide-up">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Makasih Masukannya!</h3>
              <p className="text-gray-500 dark:text-slate-400">Feedback lo bakal ngebantu DoJo jadi makin jenius buat lo.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{title}</h2>
                <p className="text-gray-500 dark:text-slate-400 text-sm">{description}</p>
              </div>

              <div className="flex justify-center gap-2 py-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-transform active:scale-90"
                  >
                    <Star 
                      className={`w-10 h-10 ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 dark:text-slate-700 hover:text-gray-300 dark:hover:text-slate-500'}`} 
                    />
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Pesan Tambahan (Opsional)</label>
                <textarea 
                  placeholder="Ceritain dong kenapa kasih rating segitu..."
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 dark:border-slate-700 focus:border-indigo-500 outline-none transition-all text-gray-800 dark:text-white font-medium text-sm bg-gray-50 dark:bg-slate-800/50 resize-none"
                  rows={3}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
              </div>

              <button 
                onClick={handleSubmit}
                disabled={rating === 0 || isSubmitting}
                className="w-full py-4 bg-gray-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-xl dark:shadow-none transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Sparkles className="w-5 h-5 animate-spin" />
                ) : (
                  <>Kirim Feedback 🚀</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
