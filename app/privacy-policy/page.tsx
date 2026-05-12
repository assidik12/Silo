import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, Eye, Database } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | DoJo',
  description: 'Kebijakan privasi penggunaan layanan DoJo.',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 md:py-20">
      <div className="max-w-3xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-indigo-600 font-bold mb-8 hover:gap-3 transition-all"
        >
          <ArrowLeft className="w-5 h-5" /> Kembali ke Home
        </Link>

        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900">Privacy Policy</h1>
          </div>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">
            <section>
              <p className="font-bold text-slate-800 italic">Terakhir Diperbarui: 12 Mei 2026</p>
              <p className="mt-4">
                Selamat datang di **DoJo**. Kami sangat menghargai privasi Anda dan berkomitmen untuk melindungi data pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda saat Anda menggunakan aplikasi kami.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xl">
                <Eye className="w-5 h-5 text-indigo-500" /> 1. Informasi yang Kami Kumpulkan
              </div>
              <div className="pl-7 space-y-4">
                <div>
                  <h3 className="font-bold text-slate-800">a. Informasi Akun</h3>
                  <p>Saat Anda mendaftar menggunakan Google Auth, kami mengumpulkan: Nama lengkap, Alamat email, dan Foto profil.</p>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">b. Data Google Drive</h3>
                  <p>DoJo meminta izin akses **Read-Only** ke Google Drive Anda melalui Google Picker. Kami hanya mengakses file yang Anda pilih secara spesifik untuk tujuan analisis AI.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xl">
                <Database className="w-5 h-5 text-indigo-500" /> 2. Penggunaan & Penyimpanan Data
              </div>
              <div className="pl-7 space-y-4">
                <p>Kami menggunakan informasi Anda untuk menyediakan fitur inti DoJo, personalisasi pengalaman belajar, dan menghasilkan gambar achievement.</p>
                <p>Data Anda disimpan secara aman menggunakan infrastruktur **Supabase** dan diproses oleh layanan AI (Google Gemini) secara rahasia.</p>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xl">
                <Lock className="w-5 h-5 text-indigo-500" /> 3. Keamanan & Hak Anda
              </div>
              <div className="pl-7 space-y-4">
                <p>Kami menerapkan standar industri untuk melindungi data Anda. Anda memiliki hak penuh untuk mengakses, memperbarui, atau menghapus akun dan data Anda kapan saja melalui menu pengaturan aplikasi.</p>
              </div>
            </section>

            <section className="pt-8 border-t border-slate-100">
              <p className="text-sm font-medium">
                Jika ada pertanyaan lebih lanjut, hubungi kami di: <br />
                <span className="text-indigo-600 font-bold">sofi.sidik12@gmail.com</span>
              </p>
            </section>
          </div>
        </div>

        <footer className="mt-12 text-center text-slate-400 text-sm font-medium">
          &copy; 2026 DoJo Productive App. Build for Students.
        </footer>
      </div>
    </div>
  );
}
