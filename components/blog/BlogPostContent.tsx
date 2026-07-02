'use client';

import { useState } from 'react';
import { Calendar, ArrowLeft, Globe } from 'lucide-react';
import Link from 'next/link';
import { Post } from '@/types/blog';

interface BlogPostContentProps {
  post: Post;
}

export default function BlogPostContent({ post }: BlogPostContentProps) {
  const [locale, setLocale] = useState<'id' | 'en'>('id');

  const hasEnglish = !!(post.title_en && post.content_en);
  const title = locale === 'en' && post.title_en ? post.title_en : post.title_id;
  const content = locale === 'en' && post.content_en ? post.content_en : post.content_id;
  const excerpt = locale === 'en' && post.excerpt_en ? post.excerpt_en : post.excerpt_id;

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '-';

  return (
    <article className="max-w-3xl mx-auto space-y-8">
      {/* Back to Blog & Language Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 text-sm font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Blog</span>
        </Link>

        {hasEnglish && (
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-fit">
            <button
              onClick={() => setLocale('id')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                locale === 'id'
                  ? 'bg-white dark:bg-slate-800 text-indigo-650 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Bahasa Indonesia 🇮🇩
            </button>
            <button
              onClick={() => setLocale('en')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                locale === 'en'
                  ? 'bg-white dark:bg-slate-800 text-indigo-650 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              English 🇬🇧
            </button>
          </div>
        )}
      </div>

      {/* Header */}
      <header className="space-y-6">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
          <Calendar className="w-4 h-4" />
          <span>{formattedDate}</span>
          {locale === 'en' && (
            <span className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-455 px-2 py-0.5 rounded-full lowercase font-normal italic">
              <Globe className="w-3 h-3" /> english version
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
          {title}
        </h1>

        {excerpt && (
          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 leading-relaxed italic border-l-2 border-slate-350 dark:border-slate-800 pl-4">
            {excerpt}
          </p>
        )}
      </header>

      {/* Cover Image */}
      {post.cover_image_url && (
        <div className="relative aspect-video w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.cover_image_url} alt={title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* HTML Content (Rendered Prose) */}
      <div
        className="prose dark:prose-invert max-w-none prose-slate dark:prose-slate pt-4
          prose-headings:font-black prose-headings:text-slate-900 dark:prose-headings:text-white
          prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
          prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
          prose-p:text-slate-650 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-6
          prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:underline hover:prose-a:text-indigo-700
          prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-50/20 dark:prose-blockquote:bg-indigo-950/10 prose-blockquote:py-2 prose-blockquote:pr-4 prose-blockquote:pl-6 prose-blockquote:rounded-r-2xl prose-blockquote:italic
          prose-strong:font-bold prose-strong:text-slate-900 dark:prose-strong:text-white
          prose-code:text-indigo-650 dark:prose-code:text-indigo-350 prose-code:bg-indigo-50/50 dark:prose-code:bg-indigo-950/20 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-lg prose-code:text-xs prose-code:font-mono
          prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2 prose-ul:mb-6
          prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-2 prose-ol:mb-6
          prose-img:rounded-2xl prose-img:shadow-md prose-img:my-8"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </article>
  );
}
