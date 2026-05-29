import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Scale, UserCheck, FileWarning, Ban } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | DoJo',
  description: 'Syarat dan Ketentuan layanan DoJo.',
};

export default function TermsOfService() {
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
              <Scale className="w-8 h-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900">Terms of Service</h1>
          </div>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">
            <section>
              <p className="font-bold text-slate-800 italic">Terakhir Diperbarui: 29 Mei 2026</p>
              <p className="mt-4">
                Selamat datang di **DoJo**. Dengan mengakses dan menggunakan layanan DoJo, Anda setuju untuk terikat oleh Syarat dan Ketentuan (Terms of Service) ini. Silakan baca dengan seksama sebelum menggunakan aplikasi kami.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xl">
                <UserCheck className="w-5 h-5 text-indigo-500" /> 1. Penggunaan Layanan & Akun
              </div>
              <div className="pl-7 space-y-4">
                <p>
                  Untuk menggunakan layanan DoJo, Anda harus mendaftar menggunakan akun Google Anda. Anda bertanggung jawab untuk menjaga kerahasiaan akun Anda dan bertanggung jawab penuh atas semua aktivitas yang terjadi di bawah akun tersebut.
                </p>
                <p>
                  Kami berhak untuk menolak layanan, menangguhkan, atau menghentikan akun Anda jika kami menemukan adanya pelanggaran terhadap ketentuan ini atau tindakan penyalahgunaan aplikasi.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xl">
                <FileWarning className="w-5 h-5 text-indigo-500" /> 2. Konten Pengguna & Tanggung Jawab
              </div>
              <div className="pl-7 space-y-4">
                <p>
                  Setiap tugas, deskripsi, atau file yang Anda masukkan ke dalam DoJo sepenuhnya adalah tanggung jawab Anda. Anda tidak diperkenankan untuk mengunggah konten yang melanggar hukum, merugikan pihak lain, atau melanggar hak kekayaan intelektual.
                </p>
                <p>
                  DoJo menyediakan fitur AI yang mengambil referensi dari data Anda untuk membantu memecah tugas atau memberikan rekomendasi. Hasil dari AI adalah panduan dan rekomendasi yang bersifat tidak mengikat.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xl">
                <Ban className="w-5 h-5 text-indigo-500" /> 3. Pembatasan Tanggung Jawab
              </div>
              <div className="pl-7 space-y-4">
                <p>
                  Layanan DoJo disediakan secara "sebagaimana adanya" (as is) dan "sebagaimana tersedia" (as available). Kami tidak menjamin bahwa aplikasi akan selalu bebas dari gangguan teknis, error, atau bug.
                </p>
                <p>
                  Kami tidak bertanggung jawab atas hilangnya data atau kerugian tidak langsung yang diakibatkan oleh penggunaan aplikasi ini. Anda menyetujui bahwa penggunaan aplikasi ini adalah atas risiko Anda sendiri.
                </p>
              </div>
            </section>

            <section className="pt-8 border-t border-slate-100">
              <p className="text-sm font-medium">
                Jika Anda memiliki pertanyaan terkait Syarat dan Ketentuan ini, hubungi kami di: <br />
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
