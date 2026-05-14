import React from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Clock, 
  Zap, 
  Smartphone, 
  FileX, 
  MessageSquare, 
  TrendingUp, 
  Sparkles,
  ArrowRight,
  User
} from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NavLinks } from '@/components/NavLinks';

export default async function LandingPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/50">
      
      {/* 1. NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-500 dark:bg-indigo-600 p-1.5 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">DoJo</span>
          </div>
          <NavLinks />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <Link href="/dashboard" className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 px-5 py-2 rounded-full text-sm font-bold transition-all hover:-translate-y-0.5 border border-indigo-200 dark:border-indigo-500/30 shadow-sm">
                <User className="w-4 h-4" />
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors hidden sm:block">
                  Login
                </Link>
                <Link href="/login" className="bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-5 py-2 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                  Mulai Gratis
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="pt-24 pb-20 px-6 overflow-hidden" id="home">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              🚀 Rilis fitur AI baru!
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 text-slate-900 dark:text-white">
              Tugas numpuk? <br className="hidden lg:block" /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">
                Santai, kita bantu beresin pelan-pelan.
              </span>
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              DoJo bantu lo ngatur tugas, ngingetin deadline, dan bikin proses belajar jadi lebih seru pake sistem reward + AI assistant.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link href={user ? "/dashboard" : "/login"} className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3.5 rounded-full font-medium shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                {user ? 'Ke Dashboard' : 'Coba Gratis'} <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#fitur" className="w-full sm:w-auto bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 px-8 py-3.5 rounded-full font-medium transition-all hover:-translate-y-1 text-center">
                Lihat Cara Kerja
              </a>
            </div>
          </div>

          <div className="flex-1 relative w-full max-w-lg">
            {/* Mockup UI Floating Cards */}
            <div className="relative z-10 bg-white dark:bg-slate-900/50 rounded-3xl p-6 shadow-xl dark:shadow-none border border-slate-100 dark:border-slate-800 transform rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 dark:text-slate-100">Tugas Hari Ini</h3>
                <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold px-2 py-1 rounded-md">🔥 5 Hari Streak</span>
              </div>
              <div className="space-y-3">
                {[
                  { title: "Essay Sejarah (1000 kata)", time: "10:00 AM", done: true },
                  { title: "Review Jurnal HCI", time: "14:00 PM", done: false },
                  { title: "Quiz Kalkulus", time: "Besok", done: false },
                ].map((task, i) => (
                  <div key={i} className={`flex items-center gap-4 p-3 rounded-xl border ${task.done ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none'}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${task.done ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}>
                      {task.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <p className={`font-medium text-sm ${task.done ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-200'}`}>{task.title}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{task.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl">
                <div className="flex justify-between text-sm mb-2 font-medium text-indigo-900 dark:text-indigo-300">
                  <span>Level 4 Scholar</span>
                  <span>450 / 500 XP</span>
                </div>
                <div className="h-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[90%] rounded-full"></div>
                </div>
              </div>
            </div>
            
            {/* Decorative background blur */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-indigo-200 to-violet-200 blur-3xl opacity-30 -z-10 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* 3. PROBLEM SECTION */}
      <section className="py-24 bg-slate-100/50 dark:bg-slate-900/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Relate nggak sih?</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">Siklus mahasiswa yang gini-gini aja, bikin tugas jadi beban pikiran terus.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-900/50 p-8 rounded-3xl shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-800 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 text-red-500 dark:text-red-400">
                <FileX className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">Tugas numpuk tapi bingung mulai dari mana</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Saking banyaknya deadline, akhirnya malah diem doang karena kewalahan ngatur prioritas.</p>
            </div>
            <div className="bg-white dark:bg-slate-900/50 p-8 rounded-3xl shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-800 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 bg-sky-50 dark:bg-sky-500/10 rounded-2xl flex items-center justify-center mb-6 text-sky-500 dark:text-sky-400">
                <Smartphone className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">Niat ngerjain, tapi malah scroll medsos terus</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Distraksi ada di mana-mana. Buka laptop niat nugas, tapi tangan otomatis buka TikTok.</p>
            </div>
            <div className="bg-white dark:bg-slate-900/50 p-8 rounded-3xl shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-800 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 bg-orange-50 dark:bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6 text-orange-500 dark:text-orange-400">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">Deadline deket baru panik</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Sistem SKS (Sistem Kebut Semalam) yang bikin jam tidur berantakan dan hasil nggak maksimal.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SOLUTION SECTION */}
      <section id="fitur" className="py-24 px-6 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Makanya kita bikin DoJo</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">Dirancang khusus buat ngakalin kebiasaan menunda lo jadi lebih terstruktur.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group text-center">
              <div className="w-20 h-20 mx-auto bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">🎯 Smart Task</h3>
              <p className="text-slate-500 dark:text-slate-400">Tugas langsung ke-track & terstruktur rapi dari awal.</p>
            </div>
            <div className="group text-center">
              <div className="w-20 h-20 mx-auto bg-violet-50 dark:bg-violet-500/10 rounded-full flex items-center justify-center mb-6 text-violet-500 dark:text-violet-400 group-hover:scale-110 transition-transform">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">⏰ Auto Reminder</h3>
              <p className="text-slate-500 dark:text-slate-400">Nggak perlu inget sendiri, kita yang bakal ingetin deadline lo.</p>
            </div>
            <div className="group text-center">
              <div className="w-20 h-20 mx-auto bg-amber-50 dark:bg-amber-500/10 rounded-full flex items-center justify-center mb-6 text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">🎮 Gamification</h3>
              <p className="text-slate-500 dark:text-slate-400">Setiap tugas selesai = dapet XP & streak. Bikin ketagihan produktif!</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. AI FEATURE SECTION */}
      <section className="py-24 px-6 bg-slate-50 dark:bg-slate-900/20">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-6">Belajar sesuai gaya lo</h2>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="mt-1 bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm dark:shadow-none text-indigo-500 dark:text-indigo-400 h-fit">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Personalized AI</h4>
                  <p className="text-slate-500 dark:text-slate-400">AI nanya personality belajar lo buat ngasih saran yang paling pas.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="mt-1 bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm dark:shadow-none text-indigo-500 dark:text-indigo-400 h-fit">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Waktu Optimal</h4>
                  <p className="text-slate-500 dark:text-slate-400">Dapet rekomendasi waktu belajar paling optimal sesuai pola hidup lo.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="mt-1 bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm dark:shadow-none text-indigo-500 dark:text-indigo-400 h-fit">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Pecah Tugas Besar</h4>
                  <p className="text-slate-500 dark:text-slate-400">Bantu pecah tugas gede biar nggak overwhelming dan gampang dicicil.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="flex-1 w-full max-w-md">
            {/* Mockup Chat AI */}
            <div className="bg-white dark:bg-slate-900/50 rounded-3xl p-6 shadow-lg dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col gap-4">
              <div className="flex gap-3 justify-end">
                <div className="bg-indigo-500 dark:bg-indigo-600 text-white p-3.5 rounded-2xl rounded-tr-sm text-sm shadow-sm max-w-[85%]">
                  Tugas essay 2000 kata ini enaknya dipecah gimana ya?
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 p-4 rounded-2xl rounded-tl-sm text-sm shadow-sm space-y-3">
                  <p>Tenang, gue bantu pecah ya biar ngerjainnya chill:</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-300 dark:text-slate-600" /> 1. Cari referensi & buat outline (Hari ini)</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-300 dark:text-slate-600" /> 2. Draft 1000 kata pertama (Besok)</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-300 dark:text-slate-600" /> 3. Draft sisanya & finishing (Lusa)</li>
                  </ul>
                  <p className="pt-2 font-medium text-indigo-600 dark:text-indigo-400">Mau masukin ini ke jadwal task lo sekarang?</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="cara-kerja" className="py-24 px-6 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Gimana Cara Kerjanya?</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">Simple banget. Lo tinggal masukin tugas, sisanya kita yang urus.</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-0.5 bg-slate-100 dark:bg-slate-800 z-0"></div>
            
            {[
              { 
                step: "01", 
                title: "Login & Sync", 
                desc: "Masuk pake akun Google, otomatis kalender lo bakal sinkron sama DoJo.",
                icon: <Smartphone className="w-6 h-6" />
              },
              { 
                step: "02", 
                title: "Input Tugas", 
                desc: "Masukin detail tugas lo, deadline, dan link materi. AI kita bisa bantu pecah tugas.",
                icon: <CheckCircle2 className="w-6 h-6" />
              },
              { 
                step: "03", 
                title: "Kerjain Santai", 
                desc: "Kita bakal ingetin lo sesuai jadwal optimal. Tinggal duduk dan kerjain.",
                icon: <Clock className="w-6 h-6" />
              },
              { 
                step: "04", 
                title: "Dapet Reward", 
                desc: "Tugas kelar, lo dapet XP dan nambah streak. Semakin sering, semakin level up!",
                icon: <Zap className="w-6 h-6" />
              }
            ].map((item, i) => (
              <div key={i} className="relative z-10 text-center group">
                <div className="w-20 h-20 mx-auto bg-white dark:bg-slate-900 border-4 border-slate-50 dark:border-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm dark:shadow-none group-hover:border-indigo-100 dark:group-hover:border-indigo-900 group-hover:scale-110 transition-all text-indigo-500 dark:text-indigo-400">
                  {item.icon}
                </div>
                <div className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-full mb-3">
                  LANGKAH {item.step}
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">{item.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PROGRESS & INSIGHT SECTION */}
      <section className="py-24 px-6 bg-white dark:bg-slate-950 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-orange-50/50 dark:bg-orange-900/10 blur-3xl rounded-full -z-10"></div>
          
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">Bangun habit tanpa kerasa berat</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-12">Fitur <span className="font-bold text-orange-500 dark:text-orange-400">Streak</span> dirancang dengan pendekatan psikologis buat ngasih lo dopamin instan setiap kali ngerjain tugas.</p>
          
          <div className="bg-white dark:bg-slate-900/50 rounded-3xl shadow-2xl dark:shadow-none shadow-slate-200/50 border border-slate-100 dark:border-slate-800 p-8 max-w-2xl mx-auto transform transition-all hover:scale-[1.01] duration-500">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
              <div className="text-left text-center sm:text-left w-full sm:w-auto">
                <h3 className="text-slate-400 font-bold uppercase tracking-wide text-xs mb-1">Momentum Saat Ini</h3>
                <div className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">5 Hari!</div>
              </div>
              <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-5 py-2.5 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-orange-200 animate-pulse">
                🔥 Lo Sedang On Fire!
              </div>
            </div>
            
            {/* Streak Timeline Graphic */}
            <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Jangan Biarin Api Ini Padam</h4>
              
              <div className="flex justify-between items-center relative px-2">
                {/* Track Line */}
                <div className="absolute left-6 right-6 top-5 -translate-y-1/2 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full z-0"></div>
                {/* Active Track Line */}
                <div className="absolute left-6 top-5 -translate-y-1/2 h-1.5 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full z-0 transition-all duration-1000" style={{ width: '65%' }}></div>
                
                {/* Simulated 7 days */}
                {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day, i) => {
                  const isActive = i < 5; // 5 days streak
                  const isToday = i === 5;
                  
                  return (
                    <div key={i} className="relative z-10 flex flex-col items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-500 ${
                        isActive 
                          ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-md dark:shadow-none shadow-orange-200 scale-110' 
                          : isToday 
                            ? 'bg-white dark:bg-slate-900 border-4 border-orange-300 dark:border-orange-500/50 text-orange-500 animate-bounce'
                            : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 text-slate-300 dark:text-slate-500'
                      }`}>
                        {isActive ? '✓' : (isToday ? '?' : '')}
                      </div>
                      <span className={`text-xs font-bold ${isActive ? 'text-orange-600 dark:text-orange-400' : isToday ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>{day}</span>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-8 bg-orange-100/50 dark:bg-orange-500/10 p-4 rounded-xl border border-orange-100 dark:border-orange-500/20">
                <p className="text-sm text-orange-800 dark:text-orange-300 font-medium leading-relaxed">
                  Cuma butuh <span className="font-extrabold bg-orange-200 dark:bg-orange-500/20 px-2 py-0.5 rounded">1 Tugas Selesai</span> hari ini untuk ngelanjutin streak lo. Sayang banget kan kalau harus ngulang dari 0 lagi?
                </p>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIAL */}
      <section id="testimoni" className="py-24 px-6 bg-slate-50 dark:bg-slate-900/20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-indigo-300 dark:text-indigo-500/50 mb-6">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
          </div>
          <h3 className="text-2xl md:text-3xl font-medium text-slate-800 dark:text-slate-200 italic leading-relaxed mb-8">
            "Awalnya iseng nyoba karena warnanya lucu, sekarang malah jadi kebiasaan tiap hari buka ini buat nge-track tugas."
          </h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            — Mahasiswa Semester 4, UI/UX Enthusiast.
          </p>
        </div>
      </section>

      {/* 8. CTA AKHIR & FOOTER */}
      <section className="py-24 px-6 bg-indigo-50 dark:bg-indigo-950/20 relative overflow-hidden">
        {/* Decorative Blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 dark:bg-indigo-500/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-200/40 dark:bg-violet-500/10 blur-3xl rounded-full"></div>
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-block bg-white dark:bg-slate-900 px-4 py-2 rounded-full shadow-sm text-sm font-bold text-orange-500 dark:text-orange-400 mb-8 border border-slate-100 dark:border-slate-800">
            🔥 Streak kamu hari ini: 0... yuk mulai bangun habitnya
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-8 tracking-tight">
            Mulai jadi versi produktif lo hari ini
          </h2>
          <Link href="/login" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-lg px-10 py-4 rounded-full font-bold shadow-xl dark:shadow-none shadow-indigo-200 hover:shadow-2xl hover:-translate-y-1 transition-all">
            Mulai Sekarang Gratis
          </Link>
        </div>
      </section>

      <footer className="bg-white dark:bg-slate-950 py-12 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-400 text-sm font-medium">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p>&copy; 2026 DoJo App. Bikin nugas nggak kerasa berat lagi.</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-300">Made with 🔥 for students</p>
          </div>
          <div className="flex gap-8 items-center">
            <Link href="/privacy-policy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
            <a href="mailto:sofi.sidik12@gmail.com" className="hover:text-indigo-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
