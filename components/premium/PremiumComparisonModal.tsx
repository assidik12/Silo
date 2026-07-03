"use client";

import { useState } from "react";
import { Sparkles, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { redeemVoucher } from "@/app/actions/voucher.actions";

interface PremiumComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPremium: boolean;
  premiumExpiresAt: string | null;
}

export default function PremiumComparisonModal({
  isOpen,
  onClose,
  isPremium,
  premiumExpiresAt,
}: PremiumComparisonModalProps) {
  const [voucherCode, setVoucherCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!voucherCode.trim()) {
      setError("Masukkan kode voucher terlebih dahulu.");
      return;
    }

    setIsRedeeming(true);
    const result = await redeemVoucher(voucherCode);
    setIsRedeeming(false);

    if (!result.success) {
      setError(result.error || "Gagal melakukan redeem voucher.");
    } else {
      const expiry = new Date(result.data?.premium_expires_at as string).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
      setSuccess(`🎉 Premium aktif! Berlaku sampai ${expiry}`);
      setVoucherCode("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-4xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-indigo-100 dark:border-indigo-900/30">
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-indigo-500" />
                Silo Premium
              </h2>
              {isPremium && premiumExpiresAt ? (
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  Aktif sampai {new Date(premiumExpiresAt).toLocaleDateString("id-ID", {
                    day: "numeric", month: "long", year: "numeric"
                  })}
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Tingkatkan produktivitas dengan akses tak terbatas.
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-2"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          {/* Form Redeem */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-2xl mb-8 border border-indigo-100 dark:border-indigo-800/30">
            <h3 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-3 flex items-center gap-2">
              🎫 Redeem Kode Voucher
            </h3>
            <form onSubmit={handleRedeem} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Masukkan kode voucher dari narasumber"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border-indigo-200 dark:border-indigo-700/50 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={isRedeeming}
                className="px-6 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 flex items-center justify-center min-w-[140px] transition-colors"
              >
                {isRedeeming ? <Loader2 className="w-5 h-5 animate-spin" /> : "Redeem"}
              </button>
            </form>
            
            {error && (
              <p className="mt-3 text-red-600 dark:text-red-400 text-sm font-medium bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                {error}
              </p>
            )}
            {success && (
              <p className="mt-3 text-emerald-600 dark:text-emerald-400 text-sm font-medium bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
                {success}
              </p>
            )}
          </div>

          {/* Fitur Comparison */}
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Perbandingan Fitur</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Fitur</th>
                    <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Free</th>
                    <th className="py-3 px-4 font-semibold text-indigo-600 dark:text-indigo-400">Premium</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  <tr>
                    <td className="py-3 px-4">Task Management</td>
                    <td className="py-3 px-4">✅ Unlimited</td>
                    <td className="py-3 px-4">✅ Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">AI Assistant (Neko)</td>
                    <td className="py-3 px-4">✅ Basic</td>
                    <td className="py-3 px-4">✅ Basic</td>
                  </tr>
                  <tr className="bg-indigo-50/50 dark:bg-indigo-900/10">
                    <td className="py-3 px-4 font-medium">Gamifikasi (XP)</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">✅ Normal XP</td>
                    <td className="py-3 px-4 text-indigo-600 dark:text-indigo-400 font-bold flex flex-col sm:flex-row gap-1">
                      ✅ 2x XP Boost <span className="text-xs self-start sm:self-center bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 px-2 py-0.5 rounded-full">+500 Bonus</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Google Calendar Sync</td>
                    <td className="py-3 px-4">✅ Full</td>
                    <td className="py-3 px-4">✅ Full</td>
                  </tr>
                  <tr className="bg-indigo-50/50 dark:bg-indigo-900/10">
                    <td className="py-3 px-4 font-medium">Journaling</td>
                    <td className="py-3 px-4 text-amber-600 dark:text-amber-400">⚠️ Max 2x/hari</td>
                    <td className="py-3 px-4 text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                      ✅ Unlimited
                    </td>
                  </tr>
                  <tr className="bg-indigo-50/50 dark:bg-indigo-900/10">
                    <td className="py-3 px-4 font-medium">AI Model</td>
                    <td className="py-3 px-4 text-amber-600 dark:text-amber-400">⚠️ 1 model</td>
                    <td className="py-3 px-4 text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                      ✅ Multi-model
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400 italic">
              Premium berlaku 30 hari sejak kode diaktifkan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
