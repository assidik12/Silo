"use client";
import { useState } from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";
import PremiumComparisonModal from "./PremiumComparisonModal";

export default function PremiumStatusCard({ 
  isPremium, 
  premiumExpiresAt 
}: { 
  isPremium: boolean; 
  premiumExpiresAt: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 dark:from-slate-950 dark:to-indigo-950/50 rounded-4xl p-6 shadow-xl relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col items-start">
          <h3 className="text-white font-bold text-lg flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-indigo-400" /> Silo Premium
          </h3>
          
          {isPremium ? (
            <>
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 mb-4">
                <CheckCircle2 className="w-4 h-4" />
                Aktif s.d {premiumExpiresAt ? new Date(premiumExpiresAt).toLocaleDateString("id-ID") : "-"}
              </div>
            </>
          ) : (
            <p className="text-slate-400 text-sm mb-4 leading-relaxed">
              Dapatkan akses tak terbatas ke Journaling AI dan fitur premium lainnya.
            </p>
          )}

          <button
            onClick={() => setIsOpen(true)}
            className="w-full py-2.5 rounded-xl font-bold text-sm transition-all bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
          >
            {isPremium ? "Lihat Status Premium" : "Redeem Voucher"}
          </button>
        </div>
      </div>
      <PremiumComparisonModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isPremium={isPremium}
        premiumExpiresAt={premiumExpiresAt}
      />
    </>
  );
}
