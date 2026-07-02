'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Save, Globe } from 'lucide-react';
import Link from 'next/link';
import BlogEditor from '@/components/admin/BlogEditor';
import { Post, PostStatus } from '@/types/blog';
import { createPost, updatePost } from '@/app/actions/blog.action';

interface PostFormProps {
  post?: Post; // If provided, we are in EDIT mode
}

export default function PostForm({ post }: PostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<'id' | 'en'>('id');

  // Form states
  const [titleId, setTitleId] = useState(post?.title_id || '');
  const [titleEn, setTitleEn] = useState(post?.title_en || '');
  const [coverImageUrl, setCoverImageUrl] = useState(post?.cover_image_url || '');
  const [excerptId, setExcerptId] = useState(post?.excerpt_id || '');
  const [excerptEn, setExcerptEn] = useState(post?.excerpt_en || '');
  const [contentId, setContentId] = useState(post?.content_id || '');
  const [contentEn, setContentEn] = useState(post?.content_en || '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (status: PostStatus) => {
    if (!titleId.trim()) {
      setError('Judul (Bahasa Indonesia) wajib diisi.');
      return;
    }
    if (!contentId.trim()) {
      setError('Konten (Bahasa Indonesia) wajib diisi.');
      return;
    }

    setError(null);

    startTransition(async () => {
      const payload = {
        title_id: titleId.trim(),
        title_en: titleEn.trim() || null,
        content_id: contentId,
        content_en: contentEn || null,
        excerpt_id: excerptId.trim() || null,
        excerpt_en: excerptEn.trim() || null,
        cover_image_url: coverImageUrl.trim() || null,
        status,
      };

      const res = post
        ? await updatePost(post.id, payload)
        : await createPost(payload);

      if (!res.success) {
        setError(res.error || 'Terjadi kesalahan saat menyimpan artikel.');
      } else {
        router.push('/admin/blog');
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <Link
          href="/admin/blog"
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-bold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali</span>
        </Link>

        <div className="flex gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleSubmit('draft')}
            className="inline-flex items-center gap-2 border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Simpan Draft</span>
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleSubmit('published')}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 shadow-sm"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
            <span>{post?.status === 'published' ? 'Update & Publish' : 'Publish Sekarang'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-650 dark:text-red-400 text-sm font-semibold rounded-2xl">
          {error}
        </div>
      )}

      {/* Grid Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Main form editors */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Selection */}
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('id')}
              className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'id'
                  ? 'border-indigo-650 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-550 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
            >
              Bahasa Indonesia 🇮🇩
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('en')}
              className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'en'
                  ? 'border-indigo-650 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-550 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
            >
              English 🇬🇧 (Optional)
            </button>
          </div>

          {/* ID Fields */}
          {activeTab === 'id' && (
            <div className="space-y-6">
              {/* Title ID */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Judul Artikel (ID)
                </label>
                <input
                  type="text"
                  placeholder="Masukkan judul artikel..."
                  value={titleId}
                  onChange={(e) => setTitleId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-indigo-500 focus:outline-none dark:text-white"
                />
              </div>

              {/* Excerpt ID */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Ringkasan / Excerpt (ID)
                </label>
                <textarea
                  placeholder="Masukkan ringkasan singkat artikel..."
                  value={excerptId}
                  onChange={(e) => setExcerptId(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-indigo-500 focus:outline-none dark:text-white resize-none"
                />
              </div>

              {/* Editor ID */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Konten Artikel (ID)
                </label>
                <BlogEditor content={contentId} onChange={setContentId} />
              </div>
            </div>
          )}

          {/* EN Fields */}
          {activeTab === 'en' && (
            <div className="space-y-6">
              {/* Title EN */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Article Title (EN)
                </label>
                <input
                  type="text"
                  placeholder="Enter article title in English..."
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-indigo-500 focus:outline-none dark:text-white"
                />
              </div>

              {/* Excerpt EN */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Excerpt (EN)
                </label>
                <textarea
                  placeholder="Enter a brief summary in English..."
                  value={excerptEn}
                  onChange={(e) => setExcerptEn(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-indigo-500 focus:outline-none dark:text-white resize-none"
                />
              </div>

              {/* Editor EN */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Article Content (EN)
                </label>
                <BlogEditor content={contentEn} onChange={setContentEn} />
              </div>
            </div>
          )}
        </div>

        {/* Right column: Sidebar settings */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-6">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Metadata & Pengaturan
            </h3>

            {/* Cover Image URL */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Cover Image URL
              </label>
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-indigo-500 focus:outline-none dark:text-white text-sm"
              />
              {coverImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coverImageUrl}
                  alt="Preview"
                  className="w-full aspect-video object-cover rounded-xl mt-2 border border-slate-200 dark:border-slate-800"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )}
            </div>

            {/* General Info */}
            <div className="text-xs text-slate-400 dark:text-slate-500 space-y-2">
              <p>
                <strong>Status Saat Ini:</strong>{' '}
                <span className="uppercase font-bold">
                  {post?.status || 'Baru (Draft)'}
                </span>
              </p>
              {post?.published_at && (
                <p>
                  <strong>Dipublikasi pada:</strong>{' '}
                  {new Date(post.published_at).toLocaleString()}
                </p>
              )}
              {post?.updated_at && (
                <p>
                  <strong>Terakhir diupdate:</strong>{' '}
                  {new Date(post.updated_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
