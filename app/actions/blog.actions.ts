'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { ActionResponse } from '@/types';
import { Post, PostStatus } from '@/types/blog';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
}

export async function createPost(data: {
  title_id: string;
  title_en: string | null;
  content_id: string;
  content_en: string | null;
  excerpt_id: string | null;
  excerpt_en: string | null;
  cover_image_url: string | null;
  status: PostStatus;
}): Promise<ActionResponse<Post>> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!data.title_id || !data.content_id) {
      return { success: false, error: 'Title (ID) and Content (ID) are required.' };
    }

    let slug = slugify(data.title_id);
    
    // Check if slug already exists and append a timestamp if it does
    const { data: existingPost } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existingPost) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const publishedAt = data.status === 'published' ? new Date().toISOString() : null;

    const { data: newPost, error } = await supabase
      .from('posts')
      .insert({
        slug,
        title_id: data.title_id,
        title_en: data.title_en,
        content_id: data.content_id,
        content_en: data.content_en,
        excerpt_id: data.excerpt_id,
        excerpt_en: data.excerpt_en,
        cover_image_url: data.cover_image_url,
        status: data.status,
        published_at: publishedAt,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/blog');
    revalidatePath(`/blog/${slug}`);
    revalidatePath('/admin/blog');
    
    return { success: true, data: newPost };
  } catch (err: any) {
    console.error('Create Post Error:', err);
    return { success: false, error: err.message || 'Gagal membuat artikel' };
  }
}

export async function updatePost(
  id: string,
  data: {
    title_id: string;
    title_en: string | null;
    content_id: string;
    content_en: string | null;
    excerpt_id: string | null;
    excerpt_en: string | null;
    cover_image_url: string | null;
    status: PostStatus;
  }
): Promise<ActionResponse<Post>> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return { success: false, error: 'Unauthorized' };
    }

    // Fetch existing post to get slug and status
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingPost) {
      return { success: false, error: 'Artikel tidak ditemukan' };
    }

    let slug = existingPost.slug;
    // If title has changed, regenerate slug
    if (existingPost.title_id !== data.title_id) {
      let tempSlug = slugify(data.title_id);
      const { data: duplicatePost } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', tempSlug)
        .neq('id', id)
        .maybeSingle();

      if (duplicatePost) {
        slug = `${tempSlug}-${Date.now().toString().slice(-4)}`;
      } else {
        slug = tempSlug;
      }
    }

    let publishedAt = existingPost.published_at;
    if (existingPost.status === 'draft' && data.status === 'published') {
      publishedAt = new Date().toISOString();
    } else if (data.status === 'draft') {
      publishedAt = null;
    }

    const { data: updatedPost, error } = await supabase
      .from('posts')
      .update({
        slug,
        title_id: data.title_id,
        title_en: data.title_en,
        content_id: data.content_id,
        content_en: data.content_en,
        excerpt_id: data.excerpt_id,
        excerpt_en: data.excerpt_en,
        cover_image_url: data.cover_image_url,
        status: data.status,
        published_at: publishedAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/blog');
    revalidatePath(`/blog/${existingPost.slug}`);
    revalidatePath(`/blog/${slug}`);
    revalidatePath('/admin/blog');

    return { success: true, data: updatedPost };
  } catch (err: any) {
    console.error('Update Post Error:', err);
    return { success: false, error: err.message || 'Gagal mengubah artikel' };
  }
}

export async function deletePost(id: string): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get the post first to revalidate its specific path
    const { data: post } = await supabase
      .from('posts')
      .select('slug')
      .eq('id', id)
      .single();

    const { error } = await supabase.from('posts').delete().eq('id', id);

    if (error) throw error;

    revalidatePath('/blog');
    if (post?.slug) {
      revalidatePath(`/blog/${post.slug}`);
    }
    revalidatePath('/admin/blog');

    return { success: true };
  } catch (err: any) {
    console.error('Delete Post Error:', err);
    return { success: false, error: err.message || 'Gagal menghapus artikel' };
  }
}

export async function togglePublish(id: string, currentStatus: PostStatus): Promise<ActionResponse<Post>> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return { success: false, error: 'Unauthorized' };
    }

    const newStatus: PostStatus = currentStatus === 'published' ? 'draft' : 'published';
    const publishedAt = newStatus === 'published' ? new Date().toISOString() : null;

    const { data: updatedPost, error } = await supabase
      .from('posts')
      .update({
        status: newStatus,
        published_at: publishedAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/blog');
    revalidatePath(`/blog/${updatedPost.slug}`);
    revalidatePath('/admin/blog');

    return { success: true, data: updatedPost };
  } catch (err: any) {
    console.error('Toggle Publish Error:', err);
    return { success: false, error: err.message || 'Gagal mengubah status publish' };
  }
}
