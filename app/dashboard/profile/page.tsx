import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { User, Medal, Settings, Mail, GraduationCap, MapPin } from 'lucide-react';
import ProfileForm from '@/components/ProfileForm';
import ShareButton from '@/components/ShareButton';
import AvatarUpload from '@/components/AvatarUpload';


export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Ambil data profile lengkap
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  const name = userData?.name || user.email?.split('@')[0] || 'User';
  const xp = userData?.xp || 0;
  const streak = userData?.streak_count || 0;
  const major = userData?.major || 'Belum diatur';
  const bio = userData?.bio || 'Mahasiswa produktif pengguna DoJo.';

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
      <header>
        <h1 className="text-3xl font-black text-slate-900">User <span className="text-indigo-600">Profile</span></h1>
        <p className="text-sm text-slate-500 mt-1">Sesuaikan identitas dan gaya belajar lo biar makin gacor.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Identity */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 text-center flex flex-col items-center">
            <div className="mb-4 ring-8 ring-indigo-50 rounded-[1.8rem]">
              <AvatarUpload 
                initialAvatarUrl={userData?.avatar_url} 
                userId={user.id} 
              />
            </div>
            <h2 className="text-2xl font-black text-slate-800 w-full truncate">
              {name}
            </h2>
            <p className="text-indigo-600 font-bold text-sm flex items-center gap-1 mt-1">
              <GraduationCap className="w-4 h-4" /> {major}
            </p>
            
            <p className="text-slate-500 text-sm mt-4 italic line-clamp-3 px-2">
              "{bio}"
            </p>

            <div className="w-full h-px bg-slate-100 my-8"></div>

            <div className="flex justify-between w-full text-left">
              <div className="bg-slate-50 p-4 rounded-2xl flex-1 mr-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total XP</p>
                <p className="text-2xl font-black text-indigo-600">{xp}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-2xl flex-1 ml-2">
                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Streak</p>
                <p className="text-2xl font-black text-orange-600">{streak} 🔥</p>
              </div>
            </div>

            <div className="mt-6 w-full space-y-3">
               <div className="flex items-center gap-3 text-slate-500 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="truncate font-medium">{user.email}</span>
              </div>
            </div>

            <ShareButton 
              userId={user.id}
              userData={{ 
                name, 
                major, 
                xp, 
                streak, 
                bio,
                learning_type: userData?.learning_type,
                avatar_url: userData?.avatar_url
              }} 
            />
          </div>

          {/* Achievements Snippet */}
          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-lg shadow-slate-200/40">
             <div className="flex items-center gap-3 mb-4">
              <Medal className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-800">Pencapaian</h3>
            </div>
            <div className="flex gap-3">
               {[
                { icon: '🎯', active: true },
                { icon: '🔥', active: streak >= 3 },
                { icon: '👑', active: xp >= 1000 },
                { icon: '⚡', active: userData?.learning_type === 'ngebut' },
              ].map((badge, i) => (
                <div key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl border ${
                  badge.active ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100 grayscale opacity-30'
                }`}>
                  {badge.icon}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/40">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">Edit Profile</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Informasi Dasar & Preferensi AI</p>
              </div>
            </div>
            
            <ProfileForm initialData={userData} />
          </div>
        </div>
      </div>
    </div>
  );
}
