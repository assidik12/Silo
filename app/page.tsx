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
  ArrowRight
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-800 font-sans selection:bg-indigo-100">
      
      {/* 1. NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-500 p-1.5 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">DoJo</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            <a href="#fitur" className="hover:text-slate-800 transition-colors">Fitur</a>
            <a href="#cara-kerja" className="hover:text-slate-800 transition-colors">Cara Kerja</a>
            <a href="#testimoni" className="hover:text-slate-800 transition-colors">Testimoni</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors hidden sm:block">
              Login
            </Link>
            <Link href="/login" className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
              Mulai Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="pt-24 pb-20 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              🚀 Rilis fitur AI baru!
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 text-slate-900">
              Tugas numpuk? <br className="hidden lg:block" /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">
                Santai, kita bantu beresin pelan-pelan.
              </span>
            </h1>
            <p className="text-lg text-slate-500 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              DoJo bantu lo ngatur tugas, ngingetin deadline, dan bikin proses belajar jadi lebih seru pake sistem reward + AI assistant.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link href="/login" className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3.5 rounded-full font-medium shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                Coba Gratis <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#fitur" className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-3.5 rounded-full font-medium transition-all hover:-translate-y-1 text-center">
                Lihat Cara Kerja
              </a>
            </div>
          </div>

          <div className="flex-1 relative w-full max-w-lg">
            {/* Mockup UI Floating Cards */}
            <div className="relative z-10 bg-white rounded-3xl p-6 shadow-xl border border-slate-100 transform rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800">Tugas Hari Ini</h3>
                <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-md">🔥 5 Hari Streak</span>
              </div>
              <div className="space-y-3">
                {[
                  { title: "Essay Sejarah (1000 kata)", time: "10:00 AM", done: true },
                  { title: "Review Jurnal HCI", time: "14:00 PM", done: false },
                  { title: "Quiz Kalkulus", time: "Besok", done: false },
                ].map((task, i) => (
                  <div key={i} className={`flex items-center gap-4 p-3 rounded-xl border ${task.done ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${task.done ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300'}`}>
                      {task.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <p className={`font-medium text-sm ${task.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.title}</p>
                      <p className="text-xs text-slate-400">{task.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-indigo-50 rounded-2xl">
                <div className="flex justify-between text-sm mb-2 font-medium text-indigo-900">
                  <span>Level 4 Scholar</span>
                  <span>450 / 500 XP</span>
                </div>
                <div className="h-2 bg-indigo-100 rounded-full overflow-hidden">
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
      <section className="py-24 bg-slate-100/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Relate nggak sih?</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Siklus mahasiswa yang gini-gini aja, bikin tugas jadi beban pikiran terus.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-6 text-red-500">
                <FileX className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Tugas numpuk tapi bingung mulai dari mana</h3>
              <p className="text-slate-500 leading-relaxed">Saking banyaknya deadline, akhirnya malah diem doang karena kewalahan ngatur prioritas.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center mb-6 text-sky-500">
                <Smartphone className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Niat ngerjain, tapi malah scroll medsos terus</h3>
              <p className="text-slate-500 leading-relaxed">Distraksi ada di mana-mana. Buka laptop niat nugas, tapi tangan otomatis buka TikTok.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 text-orange-500">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Deadline deket baru panik</h3>
              <p className="text-slate-500 leading-relaxed">Sistem SKS (Sistem Kebut Semalam) yang bikin jam tidur berantakan dan hasil nggak maksimal.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SOLUTION SECTION */}
      <section id="fitur" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Makanya kita bikin DoJo</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Dirancang khusus buat ngakalin kebiasaan menunda lo jadi lebih terstruktur.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group text-center">
              <div className="w-20 h-20 mx-auto bg-indigo-50 rounded-full flex items-center justify-center mb-6 text-indigo-500 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">🎯 Smart Task</h3>
              <p className="text-slate-500">Tugas langsung ke-track & terstruktur rapi dari awal.</p>
            </div>
            <div className="group text-center">
              <div className="w-20 h-20 mx-auto bg-violet-50 rounded-full flex items-center justify-center mb-6 text-violet-500 group-hover:scale-110 transition-transform">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">⏰ Auto Reminder</h3>
              <p className="text-slate-500">Nggak perlu inget sendiri, kita yang bakal ingetin deadline lo.</p>
            </div>
            <div className="group text-center">
              <div className="w-20 h-20 mx-auto bg-amber-50 rounded-full flex items-center justify-center mb-6 text-amber-500 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">🎮 Gamification</h3>
              <p className="text-slate-500">Setiap tugas selesai = dapet XP & streak. Bikin ketagihan produktif!</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. AI FEATURE SECTION */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">Belajar sesuai gaya lo</h2>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="mt-1 bg-white p-2 rounded-full shadow-sm text-indigo-500 h-fit">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">Personalized AI</h4>
                  <p className="text-slate-500">AI nanya personality belajar lo buat ngasih saran yang paling pas.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="mt-1 bg-white p-2 rounded-full shadow-sm text-indigo-500 h-fit">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">Waktu Optimal</h4>
                  <p className="text-slate-500">Dapet rekomendasi waktu belajar paling optimal sesuai pola hidup lo.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="mt-1 bg-white p-2 rounded-full shadow-sm text-indigo-500 h-fit">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">Pecah Tugas Besar</h4>
                  <p className="text-slate-500">Bantu pecah tugas gede biar nggak overwhelming dan gampang dicicil.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="flex-1 w-full max-w-md">
            {/* Mockup Chat AI */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 flex flex-col gap-4">
              <div className="flex gap-3 justify-end">
                <div className="bg-indigo-500 text-white p-3.5 rounded-2xl rounded-tr-sm text-sm shadow-sm max-w-[85%]">
                  Tugas essay 2000 kata ini enaknya dipecah gimana ya?
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="bg-slate-50 border border-slate-100 text-slate-700 p-4 rounded-2xl rounded-tl-sm text-sm shadow-sm space-y-3">
                  <p>Tenang, gue bantu pecah ya biar ngerjainnya chill:</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-300" /> 1. Cari referensi & buat outline (Hari ini)</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-300" /> 2. Draft 1000 kata pertama (Besok)</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-300" /> 3. Draft sisanya & finishing (Lusa)</li>
                  </ul>
                  <p className="pt-2 font-medium text-indigo-600">Mau masukin ini ke jadwal task lo sekarang?</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="cara-kerja" className="py-24 px-6 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Gimana Cara Kerjanya?</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Simple banget. Lo tinggal masukin tugas, sisanya kita yang urus.</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-0.5 bg-slate-100 z-0"></div>
            
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
                <div className="w-20 h-20 mx-auto bg-white border-4 border-slate-50 rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:border-indigo-100 group-hover:scale-110 transition-all text-indigo-500">
                  {item.icon}
                </div>
                <div className="inline-block px-3 py-1 bg-slate-100 text-slate-600 font-bold text-xs rounded-full mb-3">
                  LANGKAH {item.step}
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PROGRESS & INSIGHT SECTION */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">Lihat progres lo tiap minggu</h2>
          
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
              <div className="text-left">
                <h3 className="text-slate-500 font-medium mb-1">Produktivitas Minggu Ini</h3>
                <div className="text-4xl font-extrabold text-slate-800">75%</div>
              </div>
              <div className="bg-orange-100 text-orange-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                🔥 5 Hari Streak
              </div>
            </div>
            
            {/* Fake Chart */}
            <div className="flex items-end justify-between h-32 gap-2 mb-6">
              {[40, 60, 30, 80, 100, 75, 90].map((h, i) => (
                <div key={i} className="w-full bg-slate-100 rounded-t-md relative group">
                  <div 
                    className="absolute bottom-0 w-full bg-indigo-400 rounded-t-md group-hover:bg-indigo-500 transition-colors" 
                    style={{ height: `${h}%` }}
                  ></div>
                </div>
              ))}
            </div>
            
            <div className="bg-sky-50 p-4 rounded-2xl flex items-start gap-4 text-left">
              <TrendingUp className="w-6 h-6 text-sky-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-800">Lo on fire! 🔥</h4>
                <p className="text-sm text-slate-600">Lo lebih produktif dari 70% user lain minggu ini. Pertahanin momentumnya!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIAL */}
      <section id="testimoni" className="py-24 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-indigo-300 mb-6">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
          </div>
          <h3 className="text-2xl md:text-3xl font-medium text-slate-800 italic leading-relaxed mb-8">
            "Awalnya iseng nyoba karena warnanya lucu, sekarang malah jadi kebiasaan tiap hari buka ini buat nge-track tugas."
          </h3>
          <p className="text-slate-500 font-medium">
            — Mahasiswa Semester 4, UI/UX Enthusiast.
          </p>
        </div>
      </section>

      {/* 8. CTA AKHIR & FOOTER */}
      <section className="py-24 px-6 bg-indigo-50 relative overflow-hidden">
        {/* Decorative Blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-200/40 blur-3xl rounded-full"></div>
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-block bg-white px-4 py-2 rounded-full shadow-sm text-sm font-bold text-orange-500 mb-8">
            🔥 Streak kamu hari ini: 0... yuk mulai bangun habitnya
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-8 tracking-tight">
            Mulai jadi versi produktif lo hari ini
          </h2>
          <Link href="/login" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-lg px-10 py-4 rounded-full font-bold shadow-xl shadow-indigo-200 hover:shadow-2xl hover:-translate-y-1 transition-all">
            Mulai Sekarang Gratis
          </Link>
        </div>
      </section>

      <footer className="bg-white py-8 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6 text-center text-slate-400 text-sm">
          &copy; 2026 DoJo App. Bikin nugas nggak kerasa berat lagi.
        </div>
      </footer>
    </div>
  );
}
