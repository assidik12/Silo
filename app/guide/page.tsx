import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Book, Calendar, Zap, Brain, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Panduan Penggunaan - Silo',
  description: 'Dokumentasi dan panduan penggunaan aplikasi Silo.',
};

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/50">
      {/* NAVBAR SIMPLE */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="bg-indigo-500 dark:bg-indigo-600 p-1.5 rounded-lg">
                <Book className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold tracking-tight text-slate-900 dark:text-white">Silo Guide</span>
            </div>
          </div>
          <Link href="/dashboard" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors">
            Ke Dashboard
          </Link>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-12 items-start">
        
        {/* SIDEBAR */}
        <aside className="w-full md:w-64 shrink-0 md:sticky md:top-24 space-y-8 hidden md:block">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-4">Navigasi Panduan</h3>
            <ul className="space-y-3">
              <li>
                <a href="#tugas-kalender" className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <Calendar className="w-4 h-4" /> Manajemen Tugas
                </a>
              </li>
              <li>
                <a href="#xp-streak" className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <Zap className="w-4 h-4" /> XP & Gamifikasi
                </a>
              </li>
              <li>
                <a href="#learning-hub" className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <Brain className="w-4 h-4" /> AI Learning Hub
                </a>
              </li>
            </ul>
          </div>
        </aside>

        {/* CONTENT */}
        <main className="flex-1 max-w-3xl space-y-16">
          
          <header>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Selamat datang di Silo!</h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
              Panduan resmi ini akan membantu Anda memahami cara menggunakan Silo untuk mengalahkan kebiasaan menunda-nunda dan mengubah proses belajar menjadi lebih menyenangkan lewat sistem gamifikasi dan AI.
            </p>
          </header>

          <section id="tugas-kalender" className="scroll-mt-24 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Calendar className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Manajemen Tugas & Sync Kalender</h2>
            </div>
            
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
              <p>Di Silo, Anda tidak perlu lagi mengingat-ingat tugas. Semua terstruktur di satu tempat.</p>
              
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 my-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500" /> Cara Membuat Tugas
                </h3>
                <ol className="list-decimal list-inside space-y-3">
                  <li>Buka halaman <strong>Dashboard</strong>.</li>
                  <li>Cari form penambahan tugas (biasanya di sisi kanan layar atau melalui tombol <em>"Tambah Tugas"</em>).</li>
                  <li>Masukkan <strong>Judul Tugas</strong> dan deskripsi singkat.</li>
                  <li>Tentukan <strong>Waktu & Tanggal</strong> deadline atau kapan Anda ingin mengerjakannya.</li>
                  <li>Klik <strong>Simpan</strong>.</li>
                </ol>
              </div>

              <p><strong>Auto-Sync Google Calendar:</strong> Jika Anda login menggunakan Google, setiap tugas yang Anda buat akan otomatis ditambahkan ke Google Calendar Anda sebagai jadwal, lengkap dengan <em>reminder</em> otomatis!</p>
            </div>
          </section>

          <hr className="border-slate-200 dark:border-slate-800" />

          <section id="xp-streak" className="scroll-mt-24 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-xl text-amber-600 dark:text-amber-400">
                <Zap className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">XP, Level, & Membangun Streak</h2>
            </div>
            
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
              <p>Silo menggunakan pendekatan psikologis yang ringan agar tugas tidak terasa berat. Semakin konsisten Anda, semakin tinggi hadiahnya.</p>
              
              <ul className="space-y-4 my-6">
                <li className="flex gap-4">
                  <div className="mt-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-md text-slate-600 dark:text-slate-400 h-fit">XP</div>
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200 block mb-1">Mendapatkan XP (Experience Points)</strong>
                    Setiap kali Anda menekan tombol <strong>"DONE"</strong> pada tugas, Anda akan mendapat XP. Jumlah XP bergantung pada tingkat kesulitan dan apakah Anda menyelesaikannya tepat waktu atau tidak.
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-md text-slate-600 dark:text-slate-400 h-fit">🔥</div>
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200 block mb-1">Daily Streak</strong>
                    Selesaikan setidaknya 1 tugas setiap hari untuk menjaga nyala api (Streak) Anda. Jika terlewat satu hari saja, Streak akan kembali ke 0. Menjaga Streak memberikan efek kepuasan psikologis yang mendorong produktivitas Anda!
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <hr className="border-slate-200 dark:border-slate-800" />

          <section id="learning-hub" className="scroll-mt-24 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-xl text-purple-600 dark:text-purple-400">
                <Brain className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">AI Learning Hub</h2>
            </div>
            
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
              <p>Butuh "Guru Les Pribadi"? Learning Hub adalah ruang belajar cerdas di Silo yang ditenagai oleh kecerdasan buatan.</p>
              
              <div className="grid md:grid-cols-2 gap-6 my-6">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <strong className="text-indigo-600 dark:text-indigo-400 block mb-2">Upload Materi Kuliah</strong>
                  <p className="text-sm">Anda bisa menghubungkan folder Google Drive yang berisi materi PDF atau dokumen. AI akan "membaca" dokumen tersebut untuk Anda.</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <strong className="text-purple-600 dark:text-purple-400 block mb-2">SKS Mode (Sistem Kebut Semalam)</strong>
                  <p className="text-sm">Tidak punya waktu membaca 100 halaman PDF? Minta AI untuk merangkum hal-hal terpenting yang kemungkinan besar akan keluar di ujian.</p>
                </div>
              </div>

              <p>Anda dapat berdiskusi (chat) langsung dengan dokumen yang Anda unggah. AI akan menjawab berdasarkan isi dari dokumen tersebut secara instan.</p>
            </div>
          </section>

          <div className="mt-16 p-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl text-center border border-indigo-100 dark:border-indigo-500/20">
            <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-100 mb-3">Siap Menjadi Produktif?</h3>
            <p className="text-indigo-700 dark:text-indigo-300 mb-6">Masuk ke Dashboard sekarang dan selesaikan tugas pertama Anda hari ini!</p>
            <Link href="/dashboard" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-full transition-all hover:shadow-lg hover:-translate-y-0.5">
              Buka Dashboard
            </Link>
          </div>

        </main>
      </div>
    </div>
  );
}
