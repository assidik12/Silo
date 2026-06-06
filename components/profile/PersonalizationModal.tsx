'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Brain, Clock, GraduationCap, Heart, Zap, Coffee } from 'lucide-react';
import { updateUserProfile } from '@/app/actions/user.actions';
import { useModal } from '@/components/providers/ModalProvider';

interface PersonalizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PersonalizationModal({ isOpen, onClose }: PersonalizationModalProps) {
  const { showModal } = useModal();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    major: '',
    productive_hours: '',
    interests: '',
    learning_type: 'santai' as 'ngebut' | 'santai'
  });

  if (!isOpen) return null;

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const res = await updateUserProfile(formData);
    if (res.success) {
      showModal({
        title: 'Mantap!',
        message: 'Personalisasi lo udah tersimpan. DoJo siap nemenin lo nugas makin asik! 🚀',
        type: 'success'
      });
      onClose();
    } else {
      showModal({
        title: 'Waduh...',
        message: res.error || 'Gagal nyimpen personalisasi. Coba lagi ya!',
        type: 'error'
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden transform transition-all scale-100">
        {/* Progress Bar */}
        <div className="h-2 bg-gray-100 dark:bg-slate-800 flex">
          <div 
            className="bg-indigo-600 transition-all duration-500" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="p-8 md:p-10">
          {step === 1 && (
            <div className="space-y-6 animate-slide-up">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
                Kenalan dulu yuk! <br/>
                <span className="text-indigo-600 dark:text-indigo-400">Panggil lo siapa nih?</span>
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Nama Panggilan</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Budi, Siska..."
                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 dark:border-slate-700 focus:border-indigo-500 outline-none transition-all text-gray-800 dark:text-white font-medium text-lg bg-gray-50 dark:bg-slate-800/50 dark:placeholder-slate-400"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2 block ml-1">Jurusan Kuliah</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Teknik Informatika, Psikologi..."
                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 dark:border-slate-700 focus:border-indigo-500 outline-none transition-all text-gray-800 dark:text-white font-medium text-lg bg-gray-50 dark:bg-slate-800/50 dark:placeholder-slate-400"
                    value={formData.major}
                    onChange={e => setFormData({...formData, major: e.target.value})}
                  />
                </div>
              </div>

              <button 
                onClick={handleNext}
                disabled={!formData.name.trim() || !formData.major.trim()}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-xl dark:shadow-none shadow-indigo-200 transition-all disabled:opacity-50 disabled:shadow-none"
              >
                Lanjut ➡️
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-slide-up">
              <div className="flex gap-4 mb-6">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6" />
                </div>
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
                Vibe lo <br/>
                <span className="text-orange-500">kayak gimana?</span>
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2 block ml-1">Jam Produktif</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: 8-10 malam, Subuh..."
                    className="w-full px-5 py-3 rounded-xl border-2 border-gray-100 dark:border-slate-700 focus:border-orange-500 outline-none transition-all text-gray-800 dark:text-white font-medium bg-gray-50 dark:bg-slate-800/50 dark:placeholder-slate-400"
                    value={formData.productive_hours}
                    onChange={e => setFormData({...formData, productive_hours: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2 block ml-1">Minat Lain</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: K-Pop, Coding, Basket..."
                    className="w-full px-5 py-3 rounded-xl border-2 border-gray-100 dark:border-slate-700 focus:border-pink-500 outline-none transition-all text-gray-800 dark:text-white font-medium bg-gray-50 dark:bg-slate-800/50 dark:placeholder-slate-400"
                    value={formData.interests}
                    onChange={e => setFormData({...formData, interests: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handlePrev} className="flex-1 py-4 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-2xl font-bold transition-all">Back</button>
                <button 
                  onClick={handleNext}
                  disabled={!formData.productive_hours.trim() || !formData.interests.trim()}
                  className="flex-[2] py-4 bg-gray-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-xl dark:shadow-none transition-all disabled:opacity-50"
                >
                  Gasss 🚀
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-slide-up">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
                Tipe belajar <br/>
                <span className="text-purple-600">pilihan lo?</span>
              </h2>
              
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => setFormData({...formData, learning_type: 'ngebut'})}
                  className={`p-6 rounded-3xl border-3 text-left transition-all flex items-center gap-4 ${
                    formData.learning_type === 'ngebut' 
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-500/10' 
                      : 'border-gray-100 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-500 bg-white dark:bg-slate-900/50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${formData.learning_type === 'ngebut' ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500'}`}>
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">Ngebut (Speedrunner)</h4>
                    <p className="text-sm text-gray-500 dark:text-slate-400">To the point, cepet, langsung inti materi.</p>
                  </div>
                </button>

                <button 
                  onClick={() => setFormData({...formData, learning_type: 'santai'})}
                  className={`p-6 rounded-3xl border-3 text-left transition-all flex items-center gap-4 ${
                    formData.learning_type === 'santai' 
                      ? 'border-green-600 bg-green-50 dark:bg-green-500/10' 
                      : 'border-gray-100 dark:border-slate-800 hover:border-green-200 dark:hover:border-green-500 bg-white dark:bg-slate-900/50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${formData.learning_type === 'santai' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500'}`}>
                    <Coffee className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">Santai (Chill Learner)</h4>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Rileks, bahasa santai, vibe asik.</p>
                  </div>
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={handlePrev} className="flex-1 py-4 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-2xl font-bold transition-all">Back</button>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-xl dark:shadow-none shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Selesai & Mulai! ✨</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
