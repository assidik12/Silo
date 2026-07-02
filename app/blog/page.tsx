import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft, User } from 'lucide-react';
import { ThemeToggle } from '@/components/preferences/ThemeToggle';
import BlogCard from '@/components/blog/BlogCard';
import { Post } from '@/types/blog';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Silo Blog | Tips Belajar & Produktivitas Mahasiswa',
  description:
    'Temukan panduan, tips belajar, dan trik produktivitas harian mahasiswa untuk menghindari procrastinate dan burnout bersama Silo.',
  openGraph: {
    title: 'Silo Blog | Tips Belajar & Produktivitas Mahasiswa',
    description:
      'Temukan panduan, tips belajar, dan trik produktivitas harian mahasiswa untuk menghindari procrastinate dan burnout bersama Silo.',
    type: 'website',
  },
};

export default async function PublicBlogPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch published posts
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const postList: Post[] = posts || [];

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="font-extrabold text-3xl tracking-tighter flex items-baseline focus:outline-none">
              <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-600 via-fuchsia-600 to-rose-600 dark:from-violet-400 dark:via-fuchsia-400 dark:to-rose-400 drop-shadow-sm">
                silo
              </span>
              <span className="text-amber-500 dark:text-amber-400 ml-0.5 animate-pulse">.</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 px-5 py-2 rounded-full text-sm font-bold transition-all hover:-translate-y-0.5 border border-indigo-200 dark:border-indigo-500/30 shadow-sm"
              >
                <User className="w-4 h-4" />
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-5 py-2 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                Mulai Gratis
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 py-12 md:py-20 space-y-12">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 text-sm font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>

        {/* Title Header */}
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none text-slate-900 dark:text-white">
            Silo <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-500 to-violet-500">Blog</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
            Tips belajar, hack produktivitas harian mahasiswa, dan cerita seru seputar cara mengalahkan procrastinate.
          </p>
        </div>

        {/* Articles Grid */}
        {error ? (
          <div className="p-8 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-650 dark:text-red-400 font-semibold rounded-3xl text-center">
            Gagal memuat artikel: {error.message}
          </div>
        ) : postList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
            {postList.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-950 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
              Belum ada artikel yang dipublikasikan. Kembali lagi nanti ya! 🌱
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 py-12 border-t border-slate-100 dark:border-slate-800 mt-20">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-400 text-sm font-medium">
          <p>&copy; 2026 Silo App. Bikin nugas nggak kerasa berat lagi.</p>
          <div className="flex gap-8 items-center">
            <Link href="/privacy-policy" className="hover:text-indigo-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:text-indigo-600 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
