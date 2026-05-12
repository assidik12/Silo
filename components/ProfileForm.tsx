"use client";

import { useState } from "react";
import { updateUserProfile } from "@/app/actions/user.actions";
import { Loader2, Check, User, GraduationCap, Clock, Heart, Zap, Coffee } from "lucide-react";

interface ProfileFormProps {
  initialData: any;
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    major: initialData?.major || "",
    bio: initialData?.bio || "",
    interests: initialData?.interests || "",
    productive_hours: initialData?.productive_hours || "09:00",
    learning_type: (initialData?.learning_type as 'ngebut' | 'santai') || "santai",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await updateUserProfile(formData);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(res.error || "Gagal memperbarui profil");
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nama Lengkap */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-500" /> Nama Lengkap
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full text-gray-700 px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
            placeholder="Masukkan nama lo..."
          />
        </div>

        {/* Jurusan */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-500" /> Jurusan / Major
          </label>
          <input
            type="text"
            required
            value={formData.major}
            onChange={(e) => setFormData({ ...formData, major: e.target.value })}
            className="w-full text-gray-700 px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
            placeholder="Misal: Teknik Informatika"
          />
        </div>

        {/* Jam Produktif */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" /> Jam Paling Produktif
          </label>
          <input
            type="text"
            required
            value={formData.productive_hours}
            onChange={(e) => setFormData({ ...formData, productive_hours: e.target.value })}
            className="w-full text-gray-700 px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
            placeholder="Misal: 09:00 atau Malam Hari"
          />
        </div>

        {/* Minat */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Heart className="w-4 h-4 text-indigo-500" /> Minat / Hobi
          </label>
          <input
            type="text"
            required
            value={formData.interests}
            onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
            className="w-full text-gray-700 px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
            placeholder="Misal: AI, Musik, Coding"
          />
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700">Bio Singkat</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          className="w-full px-4 py-3 text-gray-700 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none min-h-[100px]"
          placeholder="Ceritain dikit tentang diri lo..."
        />
      </div>

      {/* Gaya Belajar */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-slate-700">Gaya Belajar</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, learning_type: 'ngebut' })}
            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
              formData.learning_type === 'ngebut'
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-slate-100 bg-white hover:border-slate-200'
            }`}
          >
            <Zap className={`w-6 h-6 ${formData.learning_type === 'ngebut' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <div className="text-center">
              <p className="text-sm font-bold">Ngebut (SKS)</p>
              <p className="text-[10px] text-slate-500">To the point & intensif</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, learning_type: 'santai' })}
            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
              formData.learning_type === 'santai'
                ? 'border-emerald-600 bg-emerald-50'
                : 'border-slate-100 bg-white hover:border-slate-200'
            }`}
          >
            <Coffee className={`w-6 h-6 ${formData.learning_type === 'santai' ? 'text-emerald-600' : 'text-slate-400'}`} />
            <div className="text-center">
              <p className="text-sm font-bold">Santai (Binge-Watch)</p>
              <p className="text-[10px] text-slate-500">Mendalam & terstruktur</p>
            </div>
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-500 font-bold">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : success ? (
          <Check className="w-5 h-5" />
        ) : null}
        {isLoading ? "Menyimpan..." : success ? "Berhasil Disimpan!" : "Update Profil"}
      </button>
    </form>
  );
}
