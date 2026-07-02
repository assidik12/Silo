import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Plus, BookOpen, FileText, Globe, Star } from 'lucide-react';
import PostRowActions from '@/components/admin/PostRowActions';
import { Post } from '@/types/blog';

export const dynamic = 'force-dynamic';

export default async function AdminBlogPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch posts
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="p-10 text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-3xl m-6">
        Error loading posts: {error.message}
      </div>
    );
  }

  const postList: Post[] = posts || [];

  // Calculate Stats
  const total = postList.length;
  const publishedCount = postList.filter((p) => p.status === 'published').length;
  const draftCount = postList.filter((p) => p.status === 'draft').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">
              Blog <span className="text-indigo-600 dark:text-indigo-400">Manager</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Buat dan publikasikan artikel blog untuk akuisisi SEO dan branding.
            </p>
          </div>
          <div>
            <Link
              href="/admin/blog/new"
              className="inline-flex items-center gap-2 bg-indigo-650 hover:bg-indigo-750 text-white px-5 py-3 rounded-2xl text-sm font-black transition-all shadow-md hover:shadow-lg focus:outline-none"
            >
              <Plus className="w-4 h-4" />
              ARTIKEL BARU
            </Link>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm transition-transform hover:scale-[1.02]">
            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
              Total Artikel
            </p>
            <div className="flex items-center gap-3">
              <p className="text-3xl font-black text-slate-900 dark:text-white">{total}</p>
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm transition-transform hover:scale-[1.02]">
            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
              Published
            </p>
            <div className="flex items-center gap-3">
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{publishedCount}</p>
              <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm transition-transform hover:scale-[1.02]">
            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
              Drafts
            </p>
            <div className="flex items-center gap-3">
              <p className="text-3xl font-black text-slate-500 dark:text-slate-400">{draftCount}</p>
              <FileText className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </div>
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-200 dark:border-slate-800/80 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Artikel
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Published At
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {postList.map((post) => {
                  const isPublished = post.status === 'published';
                  return (
                    <tr
                      key={post.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {post.cover_image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={post.cover_image_url}
                              alt={post.title_id}
                              className="w-12 h-12 object-cover rounded-xl border border-slate-200 dark:border-slate-800 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 dark:text-indigo-400 rounded-xl flex items-center justify-center font-bold text-xs shrink-0">
                              BLOG
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
                              {post.title_id}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-550 font-mono italic">
                              /{post.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full w-fit ${
                            isPublished
                              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400'
                          }`}
                        >
                          {post.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {post.published_at
                            ? new Date(post.published_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '-'}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">
                          Created: {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <PostRowActions postId={post.id} currentStatus={post.status} />
                      </td>
                    </tr>
                  );
                })}
                {postList.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-slate-400 dark:text-slate-500">
                      Belum ada artikel. Klik tombol di atas untuk membuat artikel pertama Anda! 📝
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
