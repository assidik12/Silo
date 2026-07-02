'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2, Globe, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { togglePublish, deletePost } from '@/app/actions/blog.actions';
import { PostStatus } from '@/types/blog';

interface PostRowActionsProps {
  postId: string;
  currentStatus: PostStatus;
}

export default function PostRowActions({ postId, currentStatus }: PostRowActionsProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleToggle = () => {
    startTransition(async () => {
      const res = await togglePublish(postId, currentStatus);
      if (!res.success) {
        alert(res.error || 'Gagal mengubah status publish');
      } else {
        router.refresh();
      }
    });
  };

  const handleDelete = () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus artikel ini secara permanen?')) {
      return;
    }

    startTransition(async () => {
      const res = await deletePost(postId);
      if (!res.success) {
        alert(res.error || 'Gagal menghapus artikel');
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className="flex justify-end items-center gap-2">
      {/* Toggle Publish Button */}
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`p-2 rounded-xl border transition-all ${currentStatus === 'published'
            ? 'border-amber-250 bg-amber-50 hover:bg-amber-100 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-400 dark:hover:bg-amber-950/40'
            : 'border-emerald-250 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-400 dark:hover:bg-emerald-950/40'
          } disabled:opacity-50`}
        title={currentStatus === 'published' ? 'Unpublish (Ubah ke Draft)' : 'Publish (Publikasikan)'}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : currentStatus === 'published' ? (
          <EyeOff className="w-4 h-4" />
        ) : (
          <Globe className="w-4 h-4" />
        )}
      </button>

      {/* Edit Link */}
      <Link
        href={`/admin/blog/${postId}/edit`}
        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-55 text-slate-700 dark:text-slate-350 dark:hover:bg-slate-800/80 transition-all"
        title="Edit Artikel"
      >
        <Edit2 className="w-4 h-4" />
      </Link>

      {/* Delete Button */}
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="p-2 rounded-xl border border-red-250 bg-red-50 hover:bg-red-100 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40 disabled:opacity-50 transition-all"
        title="Hapus Artikel"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
