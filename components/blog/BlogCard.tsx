import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import { Post } from '@/types/blog';

interface BlogCardProps {
  post: Post;
  locale?: 'id' | 'en';
}

export default function BlogCard({ post, locale = 'id' }: BlogCardProps) {
  const title = locale === 'en' && post.title_en ? post.title_en : post.title_id;
  const excerpt = locale === 'en' && post.excerpt_en ? post.excerpt_en : post.excerpt_id;
  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '-';

  return (
    <article className="group bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-150 dark:hover:border-indigo-900/60 transition-all duration-300 flex flex-col h-full hover:scale-[1.01]">
      {/* Cover Image */}
      <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
        {post.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image_url}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
            <span className="text-4xl font-extrabold text-indigo-500/40 dark:text-indigo-400/30 select-none">
              Silo Blog
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 flex flex-col flex-1 space-y-4">
        {/* Meta Info */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formattedDate}</span>
        </div>

        {/* Title */}
        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
          <Link href={`/blog/${post.slug}`} className="focus:outline-none">
            {title}
          </Link>
        </h3>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 flex-1">
            {excerpt}
          </p>
        )}

        {/* Read More Link */}
        <div className="pt-2">
          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex items-center gap-2 text-sm font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors group/link"
          >
            <span>Baca Selengkapnya</span>
            <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}
