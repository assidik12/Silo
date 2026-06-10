'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Budi Santoso",
    role: "Mahasiswa Sistem Informasi",
    text: "Awalnya iseng nyoba karena warnanya lucu, sekarang malah jadi kebiasaan tiap hari buka ini buat nge-track tugas.",
    avatar: "👨‍💻"
  },
  {
    id: 2,
    name: "Siti Aminah",
    role: "Mahasiswa Psikologi",
    text: "Membantu banget pas lagi banyak tugas. Fitur pecah tugas pake AI bener-bener nyelametin kewarasan gue semester ini!",
    avatar: "👩‍🎓"
  },
  {
    id: 3,
    name: "Ahmad Reza",
    role: "UI/UX Enthusiast",
    text: "Desainnya manjain mata banget! Ditambah ada sistem XP, ngerjain tugas berasa lagi main game RPG. Seru parah!",
    avatar: "🎨"
  },
  {
    id: 4,
    name: "Diana Putri",
    role: "Mahasiswa Akuntansi",
    text: "Dulu sering SKS (Sistem Kebut Semalam), sejak pake DoJo jadi lebih terstruktur karena ada AI yang ngingetin jadwal optimal.",
    avatar: "📊"
  },
  {
    id: 5,
    name: "Kevin Sanjaya",
    role: "Mahasiswa Teknik Komputer",
    text: "Sinkronisasi sama Google Calendar itu fitur yang paling kepake. Sekali klik langsung masuk jadwal, nggak perlu repot lagi.",
    avatar: "💻"
  },
  {
    id: 6,
    name: "Rina Kusuma",
    role: "Mahasiswa Ilmu Komunikasi",
    text: "UI/UX-nya juara! Bersih, ngga bikin pusing, dan fitur gamifikasinya bikin aku jadi ambis buat kerjain tugas lebih awal.",
    avatar: "✍️"
  }
];

export default function TestimonialSlider() {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(testimonials.length / itemsPerPage);

  const nextPage = () => setCurrentPage((prev) => (prev + 1) % totalPages);
  const prevPage = () => setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);

  const currentTestimonials = testimonials.slice(
    currentPage * itemsPerPage, 
    (currentPage + 1) * itemsPerPage
  );

  return (
    <div className="max-w-6xl mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Kata Mereka Tentang DoJo</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">Masih ragu? Dengerin langsung dari mahasiswa yang udah ngerasain bedanya nugas pake DoJo.</p>
      </div>

      <div className="relative">
        <div className="overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentTestimonials.map((t) => (
              <div key={t.id} className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col h-full animate-fade-in">
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-slate-700 dark:text-slate-300 mb-6 flex-grow italic leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center text-2xl border border-indigo-100 dark:border-indigo-500/20">
                    {t.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{t.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-center gap-4 mt-12">
          <button 
            onClick={prevPage}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentPage(i)}
                className={`h-2.5 rounded-full transition-all duration-300 ${currentPage === i ? 'bg-indigo-500 w-8' : 'bg-slate-300 dark:bg-slate-600 w-2.5 hover:bg-slate-400 dark:hover:bg-slate-500'}`}
                aria-label={`Go to page ${i + 1}`}
              />
            ))}
          </div>

          <button 
            onClick={nextPage}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
