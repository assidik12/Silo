import PostForm from '@/components/admin/PostForm';

export const dynamic = 'force-dynamic';

export default function NewPostPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Tulis <span className="text-indigo-600 dark:text-indigo-400">Artikel Baru</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Tulis artikel SEO-friendly dalam Bahasa Indonesia dan secara opsional dalam Bahasa Inggris.
          </p>
        </div>

        <PostForm />
      </div>
    </div>
  );
}
