export type PostStatus = 'draft' | 'published';

export interface Post {
  id: string;
  slug: string;
  title_id: string;
  title_en: string | null;
  content_id: string;
  content_en: string | null;
  excerpt_id: string | null;
  excerpt_en: string | null;
  cover_image_url: string | null;
  status: PostStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}
