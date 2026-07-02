import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { User } from 'lucide-react';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { ThemeToggle } from '@/components/preferences/ThemeToggle';
import BlogPostContent from '@/components/blog/BlogPostContent';
import { Post } from '@/types/blog';

// Initialize static client for build-time operations like generateStaticParams
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const supabaseStatic = createSupabaseClient(supabaseUrl, supabaseKey);

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { data: posts } = await supabaseStatic
    .from('posts')
    .select('slug')
    .eq('status', 'published');

  return (posts || []).map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  const { data: post } = await supabaseStatic
    .from('posts')
    .select('title_id, excerpt_id, cover_image_url')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (!post) {
    return {
      title: 'Artikel Tidak Ditemukan | Silo Blog',
    };
  }

  return {
    title: `${post.title_id} | Silo Blog`,
    description: post.excerpt_id || undefined,
    openGraph: {
      title: post.title_id,
      description: post.excerpt_id || undefined,
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : [],
      type: 'article',
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  // Fetch using supabaseStatic to ensure build compatibility (or standard cookieStore client if needed)
  const { data: post } = await supabaseStatic
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (!post) {
    notFound();
  }

  // Get user session for navbar
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

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
      <main className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        <BlogPostContent post={post as Post} />
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
