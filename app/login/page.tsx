'use client';

import { createClient } from '@/utils/supabase/client';
import { useState } from 'react';
import { CheckCircle2, Sparkles, Gamepad2 } from 'lucide-react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleGoogleLogin = async () => {
    console.log('test')
    setLoading(true);
    setError(null);
    console.log(`${window.location.origin}/auth/callback`)
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
      },
    });

    console.log(error)
    if (error) {
      setError(error.message);  
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 overflow-hidden selection:bg-indigo-200">
      
      {/* Decorative Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" style={{ animationDuration: '6s' }}></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-sky-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" style={{ animationDuration: '5s' }}></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" style={{ animationDuration: '7s' }}></div>

      <div className="relative z-10 w-full max-w-md p-6">
        {/* Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-10 shadow-2xl shadow-indigo-100 border border-white/50 text-center transform transition-all hover:scale-[1.02] duration-500">
          
          <div className="mx-auto w-20 h-20 bg-indigo-500 rounded-3xl rotate-6 flex items-center justify-center shadow-xl shadow-indigo-200 mb-8 transition-transform hover:rotate-12 duration-300">
            <CheckCircle2 className="w-10 h-10 text-white -rotate-6" />
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
            Siap Nugas?
          </h2>
          <p className="text-slate-500 mb-10 font-medium">
            Masuk ke <span className="text-indigo-600 font-bold">DoJo</span>, kelarin tugas dapet XP & Streak! 🚀
          </p>
          
          {error && (
            <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="group relative flex w-full items-center justify-center gap-4 rounded-2xl bg-white px-4 py-4 text-base font-bold text-slate-700 shadow-md border border-slate-100 hover:shadow-xl hover:-translate-y-1 hover:border-indigo-100 hover:text-indigo-600 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500 animate-spin-slow" />
                Nyiapin DoJo buat lo...
              </span>
            ) : (
              <>
                <svg className="w-6 h-6 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Masuk Pake Google
              </>
            )}
          </button>

          <div className="mt-8 flex justify-center items-center gap-2 text-sm text-slate-400 font-medium bg-slate-50/50 w-fit mx-auto px-4 py-2 rounded-full border border-slate-100">
            <Gamepad2 className="w-4 h-4 text-indigo-400" />
            <p>Gamified Productivity App</p>
          </div>
        </div>
      </div>
    </div>
  );
}
