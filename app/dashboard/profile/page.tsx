import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { User, Medal, Settings, Mail, Star } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Ambil data XP dan Streak
  const { data: userData } = await supabase
    .from('users')
    .select('xp, streak_count')
    .eq('id', user.id)
    .single();

  const xp = userData?.xp || 0;
  const streak = userData?.streak_count || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900">User Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Kelola data diri dan lihat koleksi pencapaian lo.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1 bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40 text-center flex flex-col items-center">
          <div className="w-24 h-24 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mb-4 ring-4 ring-indigo-50">
            <User className="w-12 h-12" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 w-full truncate" title={user.email || ''}>
            {user.email?.split('@')[0]}
          </h2>
          <div className="flex items-center gap-2 mt-2 text-slate-500 text-sm bg-slate-50 px-3 py-1 rounded-full">
            <Mail className="w-4 h-4" />
            <span className="truncate w-full">{user.email}</span>
          </div>

          <div className="w-full h-px bg-slate-100 my-6"></div>

          <div className="flex justify-between w-full text-left">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total XP</p>
              <p className="text-xl font-extrabold text-indigo-600">{xp}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Max Streak</p>
              <p className="text-xl font-extrabold text-orange-500">{streak} 🔥</p>
            </div>
          </div>
        </div>

        {/* Badges / Settings */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40">
            <div className="flex items-center gap-3 mb-6">
              <Medal className="w-6 h-6 text-amber-500" />
              <h3 className="text-xl font-bold text-slate-800">Pencapaian (Coming Soon)</h3>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { name: 'First Blood', desc: 'Tugas pertama selesai', icon: '🎯', active: true },
                { name: 'On Fire', desc: 'Streak 3 hari', icon: '🔥', active: streak >= 3 },
                { name: 'Master', desc: '1000 XP tercapai', icon: '👑', active: xp >= 1000 },
              ].map((badge, i) => (
                <div key={i} className={`p-4 rounded-2xl border text-center transition-all ${
                  badge.active ? 'bg-amber-50 border-amber-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-50 grayscale'
                }`}>
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <div className="font-bold text-slate-800 text-sm">{badge.name}</div>
                  <div className="text-xs text-slate-500 mt-1">{badge.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40">
             <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-slate-500" />
              <h3 className="text-xl font-bold text-slate-800">Pengaturan Akun</h3>
            </div>
            <p className="text-slate-500 text-sm mb-4">
              Fitur edit profile lebih detail akan segera hadir di update selanjutnya!
            </p>
            <button disabled className="px-4 py-2 bg-slate-100 text-slate-400 font-bold rounded-xl cursor-not-allowed">
              Edit Profile (Locked)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
