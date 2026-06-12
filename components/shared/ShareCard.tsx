import React, { forwardRef } from 'react';
import { User, GraduationCap, Flame, Trophy } from 'lucide-react';

interface ShareCardProps {
  userData: {
    name: string;
    major: string;
    xp: number;
    streak: number;
    bio: string;
    learning_type?: string;
    avatar_url?: string;
  };
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(({ userData }, ref) => {
  const badges = [
    { icon: '🎯', label: 'Goal Getter', active: true },
    { icon: '🔥', label: 'On Fire', active: userData.streak >= 3 },
    { icon: '👑', label: 'The King', active: userData.xp >= 1000 },
    { icon: '⚡', label: 'Speed Learner', active: userData.learning_type === 'ngebut' },
  ];

  return (
    <div 
      ref={ref}
      className="w-[390px] h-[844px] bg-linear-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-8 flex flex-col justify-between text-white relative overflow-hidden"
      style={{ fontFamily: 'sans-serif' }} // Ensure a clean font for capture
    >
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white dark:bg-slate-900/50/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-5%] left-[-5%] w-80 h-80 bg-fuchsia-400/20 rounded-full blur-3xl"></div>
      
      {/* Mascot Neko */}
      <img src="/assets/mascots/neko_share_card_1781151393640.png" alt="Neko Flex" className="absolute bottom-16 right-[-20px] w-48 h-48 object-contain opacity-95 rotate-[-5deg] z-0 drop-shadow-2xl" />

      {/* Header Branding */}
      <div className="flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white dark:bg-slate-900/50 rounded-xl flex items-center justify-center shadow-lg dark:shadow-none">
            <span className="text-indigo-600 dark:text-indigo-400 font-black text-xl italic">D</span>
          </div>
          <span className="font-black text-2xl tracking-tighter">Silo</span>
        </div>
        <div className="bg-white dark:bg-slate-900/50/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30 text-[10px] font-bold uppercase tracking-widest">
          Q3 Achievement
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-8 z-10">
        <div className="space-y-6">
          <div className="w-32 h-32 bg-white dark:bg-slate-900/50/20 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center border border-white/40 shadow-2xl mx-auto ring-8 ring-white/10 overflow-hidden">
            {userData.avatar_url ? (
              <img src={userData.avatar_url} alt={userData.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-16 h-16 text-white" />
            )}
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black tracking-tight">{userData.name}</h1>
            <p className="text-indigo-100 font-bold flex items-center justify-center gap-2">
              <GraduationCap className="w-5 h-5" /> {userData.major}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900/50/15 backdrop-blur-lg rounded-3xl p-6 border border-white/20 text-center">
            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Total XP</p>
            <div className="flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-amber-300" />
              <span className="text-4xl font-black">{userData.xp}</span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900/50/15 backdrop-blur-lg rounded-3xl p-6 border border-white/20 text-center">
            <p className="text-[10px] font-black text-orange-200 uppercase tracking-widest mb-1">Streak</p>
            <div className="flex items-center justify-center gap-2">
              <Flame className="w-5 h-5 text-orange-400 fill-orange-400" />
              <span className="text-4xl font-black">{userData.streak}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/50/10 backdrop-blur-md rounded-4xl p-6 border border-white/10">
          <h3 className="text-xs font-black uppercase tracking-widest text-white/60 mb-4 text-center">Unlocked Badges</h3>
          <div className="flex justify-center gap-4">
            {badges.map((badge, i) => (
              <div key={i} className={`group relative flex flex-col items-center`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border transition-all duration-300 ${
                  badge.active 
                    ? 'bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white border-white shadow-xl dark:shadow-none scale-110' 
                    : 'bg-white dark:bg-slate-900/50/5 border-white/10 grayscale opacity-20'
                }`}>
                  {badge.icon}
                </div>
                {badge.active && (
                  <span className="text-[8px] font-bold mt-2 uppercase tracking-tighter text-indigo-100">
                    {badge.label}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="text-center space-y-4 z-10">
        <div className="h-px w-full bg-linear-to-r from-transparent via-white/30 to-transparent"></div>
        <p className="text-sm font-medium text-indigo-100/80 italic px-6">
          "{userData.bio || 'Belajar jadi lebih asik dan produktif di Silo.'}"
        </p>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 pt-4">
          Join the Silo @ silo.app
        </p>
      </div>
    </div>
  );
});

ShareCard.displayName = 'ShareCard';

export default ShareCard;
