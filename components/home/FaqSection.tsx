"use client";

import { useState } from "react";
import { ChevronDown, MessageSquareHeart } from "lucide-react";

const faqs = [
  {
    q: "Apa itu Silo?",
    a: "Silo adalah platform gamifikasi produktivitas untuk membantumu fokus belajar dan mengerjakan tugas layaknya bermain game. Dapet XP, kumpulin Streak, dan jadikan proses belajar lebih seru!"
  },
  {
    q: "Bagaimana cara dapat XP?",
    a: "Gampang banget! Kamu bisa dapat XP dengan menyelesaikan tugas (Task), nyelesain timer Pomodoro, atau merampungkan modul belajar di Learning Hub. Semakin rajin, semakin tinggi levelmu."
  },
  {
    q: "Apa itu Binge-Watch dan SKS Mode?",
    a: "Binge-Watch Mode memecah materi panjang (dari Google Drive/PDF) menjadi beberapa 'episode' kecil agar otakmu nggak gampang capek. Sedangkan SKS Mode bakal ngerangkum seluruh materi dalam satu kanvas kilat buat kamu yang butuh belajar cepat semalam sebelum ujian."
  },
  {
    q: "Kenapa Streak saya tiba-tiba hilang?",
    a: "Streak kamu akan reset ke 0 jika kamu gagal menyelesaikan minimal 1 tugas dalam 1 hari. Sama kayak game, kamu harus login dan main (nugas) tiap hari buat jaga api streak-nya tetap menyala!"
  },
  {
    q: "Apakah AI Neko bayar?",
    a: "Saat ini AI Neko bisa digunakan secara gratis selama masa beta. Neko bakal bantu ngejelasin materi, bikin kuis, atau kasih contoh studi kasus biar kamu cepat paham."
  }
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 px-6 bg-slate-50 dark:bg-slate-900/20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-6 shadow-sm">
            <MessageSquareHeart className="w-8 h-8" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            Pertanyaan yang Sering Muncul
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Masih bingung gimana cara kerja Silo? Tenang, kita udah rangkum jawaban dari pertanyaan-pertanyaan yang paling sering ditanyain di bawah ini.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`border ${openIndex === index ? 'border-indigo-500 dark:border-indigo-500 shadow-md' : 'border-slate-200 dark:border-slate-800'} bg-white dark:bg-slate-900 rounded-2xl overflow-hidden transition-all duration-300`}
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none"
              >
                <span className="text-lg font-bold text-slate-800 dark:text-slate-100 pr-4">
                  {faq.q}
                </span>
                <span className={`flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 transition-transform duration-300 ${openIndex === index ? 'rotate-180 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500' : ''}`}>
                  <ChevronDown className="w-5 h-5" />
                </span>
              </button>
              
              <div 
                className={`px-6 text-slate-600 dark:text-slate-400 leading-relaxed transition-all duration-300 ease-in-out overflow-hidden ${openIndex === index ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 py-0 opacity-0'}`}
              >
                {faq.a}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center bg-indigo-50 dark:bg-indigo-950/30 p-8 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 flex flex-col items-center">
          <img src="/assets/mascots/neko_ask_task_1781150994594.png" alt="Neko" className="w-16 h-16 object-contain mb-4 filter drop-shadow-md" />
          <h4 className="font-bold text-slate-900 dark:text-white mb-2">Masih punya pertanyaan lain?</h4>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-md mx-auto">
            Kalau kamu nemu bug, punya ide fitur baru, atau mau ngobrol sama developer, jangan ragu buat kontak kita!
          </p>
          <a 
            href="mailto:sofi.sidik12@gmail.com" 
            className="inline-flex items-center justify-center bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700 hover:border-indigo-500 hover:text-indigo-700 hover:shadow-md px-6 py-2.5 rounded-full font-bold transition-all"
          >
            Hubungi Developer
          </a>
        </div>
      </div>
    </section>
  );
}
