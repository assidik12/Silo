"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ArrowRight, ArrowLeft } from "lucide-react";

const STEPS = [
  {
    title: "🎯 Mulai Dari Sini",
    desc: "Ini adalah daftar tugasmu. Semakin banyak yang selesai, semakin cepat level up!",
    // We can't really attach to the exact DOM element easily without refs in this simple modal,
    // so we'll just show it as a centered/floating guide that explains the dashboard.
    align: "bottom-left", 
  },
  {
    title: "🔥 Jaga Streak-mu",
    desc: "Cek XP dan Streak harianmu di bagian atas sini. Jangan sampai bolong biar dapet bonus XP!",
    align: "top-right",
  },
  {
    title: "🧠 Learning Hub",
    desc: "Butuh ngerjain tugas cepet? Masuk ke Learning Hub buat aktifin fitur AI SKS Mode.",
    align: "bottom-right",
  }
];

export function OnboardingTour() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user already completed onboarding
    const hasCompleted = localStorage.getItem("dojo_onboarding_completed");
    if (!hasCompleted) {
      // Delay slightly for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const completeOnboarding = () => {
    setIsVisible(false);
    localStorage.setItem("dojo_onboarding_completed", "true");
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="pointer-events-auto bg-white dark:bg-slate-900 w-full max-w-sm p-6 rounded-3xl shadow-2xl border border-indigo-100 dark:border-indigo-500/20 relative mx-4"
        >
          <button 
            onClick={completeOnboarding}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-md">
              Step {currentStep + 1} / {STEPS.length}
            </span>
          </div>

          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            {STEPS[currentStep].title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            {STEPS[currentStep].desc}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentStep 
                      ? "w-6 bg-indigo-500" 
                      : i < currentStep 
                        ? "w-2 bg-indigo-300 dark:bg-indigo-800" 
                        : "w-2 bg-slate-200 dark:bg-slate-800"
                  }`} 
                />
              ))}
            </div>
            
            <div className="flex gap-2">
              {currentStep > 0 && (
                <button 
                  onClick={prevStep}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <button 
                onClick={nextStep}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all"
              >
                {currentStep === STEPS.length - 1 ? (
                  <>Selesai <Check className="w-4 h-4" /></>
                ) : (
                  <>Lanjut <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
