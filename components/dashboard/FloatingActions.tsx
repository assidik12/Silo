"use client";

import { useState, useEffect } from 'react';
import { ThemeToggle } from '../preferences/ThemeToggle';
import { Sparkles } from 'lucide-react';
import PremiumComparisonModal from '@/components/premium/PremiumComparisonModal';
import { createClient } from '@/utils/supabase/client';

export default function FloatingActions() {
  const supabase = createClient();
  const [isPremium, setIsPremium] = useState(false);
  const [premiumExpiresAt, setPremiumExpiresAt] = useState<string | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase
          .from("users")
          .select("is_premium, premium_expires_at")
          .eq("id", user.id)
          .single();
          
        if (userData) {
          const isActive = userData.is_premium && userData.premium_expires_at && new Date(userData.premium_expires_at) > new Date();
          setIsPremium(!!isActive);
          setPremiumExpiresAt(userData.premium_expires_at ?? null);
        }
      }
    };
    checkUser();
  }, [supabase]);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <button
          onClick={() => setShowPremiumModal(true)}
          className={`flex items-center gap-2 px-4 py-3 rounded-full font-bold shadow-xl transition-all hover:scale-105 ${
            isPremium
              ? 'bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-200 backdrop-blur-md border border-indigo-200 dark:border-indigo-500/30'
              : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
          }`}
        >
          <Sparkles className="w-5 h-5 shrink-0" />
          <span className="hidden sm:inline">
            {isPremium ? "Premium Info" : "Redeem Premium"}
          </span>
        </button>
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full shadow-lg border border-slate-200 dark:border-slate-800 p-1 flex items-center justify-center">
          <ThemeToggle />
        </div>
      </div>

      <PremiumComparisonModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        isPremium={isPremium}
        premiumExpiresAt={premiumExpiresAt}
      />
    </>
  );
}
