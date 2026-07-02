import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import PostForm from '@/components/admin/PostForm';
import { Post } from '@/types/blog';

export const dynamic = 'force-dynamic';

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Edit <span className="text-indigo-600 dark:text-indigo-400">Artikel</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Perbarui artikel Anda di sini. Perubahan akan disimpan sebagai draft atau langsung dipublikasikan.
          </p>
        </div>

        <PostForm post={post as Post} />
      </div>
    </div>
  );
}
