import { getVouchers, getPremiumUsers, createVoucher } from "@/app/actions/admin-vouchers.actions";
import { Ticket, Users, RefreshCw, Send, ShieldCheck, Mail, AlertCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminVouchersPage() {
  const vouchers = await getVouchers();
  const premiumUsers = await getPremiumUsers();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <Ticket className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          Voucher & Premium Manager
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Kelola distribusi voucher seminar dan pantau konversi premium.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Create Voucher Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-indigo-500" />
              Generate Voucher Baru
            </h2>
            
            <form action={createVoucher} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Nama Dosen / Narsum
                </label>
                <input
                  type="text"
                  name="lecturerName"
                  required
                  placeholder="Misal: Dr. Budi Setiawan"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Email Dosen
                </label>
                <input
                  type="email"
                  name="lecturerEmail"
                  required
                  placeholder="budi@kampus.ac.id"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Jumlah Kuota (Max Uses)
                </label>
                <input
                  type="number"
                  name="maxUses"
                  required
                  min="1"
                  defaultValue="50"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Kode Voucher (Custom/Auto)
                </label>
                <input
                  type="text"
                  name="code"
                  required
                  defaultValue={`SILO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`}
                  className="w-full px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400 font-mono font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 mt-4"
              >
                <Send className="w-5 h-5" />
                Generate & Simpan
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Monitoring */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Vouchers Table */}
          <div className="bg-white dark:bg-slate-950 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Ticket className="w-5 h-5 text-emerald-500" />
                Voucher Aktif
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase text-xs font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Kode</th>
                    <th className="px-6 py-4">Dosen</th>
                    <th className="px-6 py-4">Penggunaan</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {vouchers.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded">
                          {v.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800 dark:text-slate-200">{v.lecturer_name || "-"}</p>
                        <p className="text-xs text-slate-500">{v.lecturer_email || "-"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 max-w-[100px]">
                            <div 
                              className="bg-emerald-500 h-2 rounded-full" 
                              style={{ width: `${(v.current_uses / v.max_uses) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            {v.current_uses}/{v.max_uses}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a 
                          href={`mailto:${v.lecturer_email}?subject=Kode Voucher Premium Silo&body=Halo ${v.lecturer_name},%0D%0A%0D%0ABerikut adalah kode voucher untuk dibagikan saat seminar:%0D%0A%0D%0AKode: ${v.code}%0D%0AKuota: ${v.max_uses} mahasiswa%0D%0A%0D%0ASalam hangat,%0D%0ATim Silo`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors text-xs font-bold"
                        >
                          <Mail className="w-3.5 h-3.5" /> Email
                        </a>
                      </td>
                    </tr>
                  ))}
                  {vouchers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                        Belum ada voucher yang di-generate.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Premium Users Monitoring */}
          <div className="bg-white dark:bg-slate-950 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                Active Premium Users
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase text-xs font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Source</th>
                    <th className="px-6 py-4">Expired At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {premiumUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{user.name || "Anonymous"}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        {user.signup_source ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                            {user.signup_source}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                        {new Date(user.premium_expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                  {premiumUsers.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                        Belum ada user premium yang aktif.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
