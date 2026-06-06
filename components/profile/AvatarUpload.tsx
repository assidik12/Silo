'use client';

import { useState, useRef } from "react";
import { User, Camera, Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { updateUserAvatar } from "@/app/actions/user.actions";

interface AvatarUploadProps {
  initialAvatarUrl?: string;
  userId: string;
}

export default function AvatarUpload({ initialAvatarUrl, userId }: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran foto maksimal 2MB ya!");
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/avatar-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { 
          upsert: true,
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const res = await updateUserAvatar(publicUrl);
      if (res.success) {
        setAvatarUrl(publicUrl);
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      console.error("Avatar Upload Error:", err);
      alert(err.message || "Gagal upload foto");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah trigger file input
    if (!avatarUrl) return;
    if (!confirm("Yakin mau hapus foto profil?")) return;

    setIsUploading(true);
    try {
      // 1. Ambil path dari URL (avatars/bucket/userId/filename)
      const path = avatarUrl.split('avatars/')[1];
      
      if (path) {
        await supabase.storage.from('avatars').remove([path]);
      }

      // 2. Update Database jadi null
      const res = await updateUserAvatar("");
      if (res.success) {
        setAvatarUrl("");
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      console.error("Delete Avatar Error:", err);
      alert("Gagal hapus foto profil.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="relative w-24 h-24 group cursor-pointer"
      >
        <div className="w-full h-full rounded-[1.8rem] overflow-hidden bg-indigo-100 dark:bg-indigo-900/50 border-4 border-white dark:border-slate-800 shadow-xl dark:shadow-none shadow-slate-200 transition-all group-hover:scale-105 group-active:scale-95 flex items-center justify-center">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User className="w-12 h-12 text-indigo-500" />
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[1.6rem]">
            <Camera className="text-white w-6 h-6" />
          </div>
        </div>
        
        {isUploading && (
          <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/80 backdrop-blur-sm rounded-[1.8rem] flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-spin" />
          </div>
        )}

        {/* Delete Button */}
        {avatarUrl && !isUploading && (
          <button
            onClick={handleDelete}
            className="absolute -top-1 -right-1 bg-red-500 text-white p-1.5 rounded-full shadow-lg dark:shadow-none hover:bg-red-600 transition-all z-20 scale-0 group-hover:scale-100"
            title="Hapus foto"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleAvatarChange} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
}
