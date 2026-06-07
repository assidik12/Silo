import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { Metadata, ResolvingMetadata } from 'next';
import { User, GraduationCap, Flame, Trophy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (!userData) {
    return { title: 'DoJo Achievement' };
  }

  const name = userData.name || 'User';
  const xp = userData.xp || 0;
  const streak = userData.streak_count || 0;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL 
    ? (process.env.NEXT_PUBLIC_BASE_URL.startsWith('http') ? process.env.NEXT_PUBLIC_BASE_URL : `http://${process.env.NEXT_PUBLIC_BASE_URL}`)
    : 'https://dojo-app.vercel.app';

  const ogUrl = new URL(`${baseUrl}/api/og`);
  ogUrl.searchParams.set('name', name);
  ogUrl.searchParams.set('xp', xp.toString());
  ogUrl.searchParams.set('streak', streak.toString());
  ogUrl.searchParams.set('major', userData.major || 'Mahasiswa');
  ogUrl.searchParams.set('learningType', userData.learning_type || '');

  return {
    title: `${name}'s Dojo Achievement`,
    description: `Lihat progres produktivitas ${name} di DoJo! Total XP: ${xp}, Streak: ${streak} hari. 🔥`,
    openGraph: {
      images: [ogUrl.toString()],
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">Achievement Not Found</h1>
          <p className="text-slate-500 mt-2">Mungkin link-nya salah atau user ini lagi sembunyi.</p>
          <Button asChild className="mt-6">
            <Link href="/">Kembali ke Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const name = userData.name || 'User';
  const xp = userData.xp || 0;
  const streak = userData.streak_count || 0;

  return (
    <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-4 bg-linear-to-br from-indigo-600 via-violet-600 to-fuchsia-600">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] overflow-hidden shadow-2xl animate-scale-in">
        <div className="p-8 text-center space-y-6">
          <div className="inline-flex mb-2">
            {userData.avatar_url ? (
              <div className="w-24 h-24 rounded-4xl overflow-hidden border-4 border-indigo-50 shadow-lg">
                <img src={userData.avatar_url} alt={name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600">
                <Trophy className="w-8 h-8" />
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{name}</h1>
            <p className="text-slate-500 font-medium flex items-center justify-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-400" /> {userData.major || 'Mahasiswa'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total XP</p>
              <p className="text-3xl font-black text-indigo-600">{xp}</p>
            </div>
            <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
              <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Streak</p>
              <p className="text-3xl font-black text-orange-600">{streak} 🔥</p>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-4xl space-y-4">
            <p className="text-sm font-medium opacity-80 italic">
              "{userData.bio || 'Belajar jadi lebih asik dan produktif di DoJo.'}"
            </p>
            <div className="flex justify-center gap-3">
               {[
                { icon: '🎯', active: true },
                { icon: '🔥', active: streak >= 3 },
                { icon: '👑', active: xp >= 1000 },
                { icon: '⚡', active: userData.learning_type === 'ngebut' },
              ].map((badge, i) => (
                <div key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                  badge.active ? 'bg-white/20 border border-white/20' : 'opacity-20 grayscale'
                }`}>
                  {badge.icon}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 space-y-3">
             <Button asChild className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-lg shadow-indigo-100">
                <Link href="/">
                  Join the Dojo <ExternalLink className="w-5 h-5 ml-2" />
                </Link>
             </Button>
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Build your productivity empire</p>
          </div>
        </div>
      </div>
      
      <footer className="mt-8 text-white/60 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
        <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-[10px]">D</div>
        DoJo Productive App
      </footer>
    </div>
  );
}
