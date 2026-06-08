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
    semester: initialData?.semester || 1,
    ai_persona: (initialData?.ai_persona as 'aesthetic' | 'savage' | 'mindful') || "mindful",
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
          <label className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-500" /> Nama Lengkap
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full text-gray-700 dark:text-slate-200 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 focus:border-indigo-500 transition-all outline-none dark:bg-slate-900/50"
            placeholder="Masukkan nama lo..."
          />
        </div>

        {/* Jurusan */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-500" /> Jurusan / Major
          </label>
          <input
            type="text"
            required
            value={formData.major}
            onChange={(e) => setFormData({ ...formData, major: e.target.value })}
            className="w-full text-gray-700 dark:text-slate-200 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 focus:border-indigo-500 transition-all outline-none dark:bg-slate-900/50"
            placeholder="Misal: Teknik Informatika"
          />
        </div>

        {/* Semester */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" /> Semester
          </label>
          <input
            type="number"
            min="1"
            max="14"
            required
            value={formData.semester}
            onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) || 1 })}
            className="w-full text-gray-700 dark:text-slate-200 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 focus:border-indigo-500 transition-all outline-none dark:bg-slate-900/50"
            placeholder="Misal: 5"
          />
        </div>

        {/* Jam Produktif */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" /> Jam Paling Produktif
          </label>
          <input
            type="text"
            required
            value={formData.productive_hours}
            onChange={(e) => setFormData({ ...formData, productive_hours: e.target.value })}
            className="w-full text-gray-700 dark:text-slate-200 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 focus:border-indigo-500 transition-all outline-none dark:bg-slate-900/50"
            placeholder="Misal: 09:00 atau Malam Hari"
          />
        </div>

        {/* Minat */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <Heart className="w-4 h-4 text-indigo-500" /> Minat / Hobi
          </label>
          <input
            type="text"
            required
            value={formData.interests}
            onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
            className="w-full text-gray-700 dark:text-slate-200 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 focus:border-indigo-500 transition-all outline-none dark:bg-slate-900/50"
            placeholder="Misal: AI, Musik, Coding"
          />
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Bio Singkat</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          className="w-full px-4 py-3 text-gray-700 dark:text-slate-200 rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 focus:border-indigo-500 transition-all outline-none min-h-[100px] dark:bg-slate-900/50"
          placeholder="Ceritain dikit tentang diri lo..."
        />
      </div>

      {/* Gaya Belajar */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Gaya Belajar</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, learning_type: 'ngebut' })}
            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
              formData.learning_type === 'ngebut'
                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10'
                : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-200 '
            }`}
          >
            <Zap className={`w-6 h-6 ${formData.learning_type === 'ngebut' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
            <div className="text-center">
              <p className="text-sm font-bold">Ngebut (SKS)</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">To the point & intensif</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, learning_type: 'santai' })}
            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
              formData.learning_type === 'santai'
                ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-200 '
            }`}
          >
            <Coffee className={`w-6 h-6 ${formData.learning_type === 'santai' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
            <div className="text-center">
              <p className="text-sm font-bold">Santai (Binge-Watch)</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Mendalam & terstruktur</p>
            </div>
          </button>
        </div>
      </div>

      {/* AI Persona Selector */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Gaya Bahasa AI Jurnal</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, ai_persona: 'mindful' })}
            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
              formData.ai_persona === 'mindful'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-200 '
            }`}
          >
            <div className="text-center">
              <p className="text-sm font-bold">Mindful 💙</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Suportif & empati</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, ai_persona: 'savage' })}
            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
              formData.ai_persona === 'savage'
                ? 'border-red-500 bg-red-50 dark:bg-red-500/10'
                : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-200 '
            }`}
          >
            <div className="text-center">
              <p className="text-sm font-bold">Savage 🔥</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Blak-blakan & tegas</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, ai_persona: 'aesthetic' })}
            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
              formData.ai_persona === 'aesthetic'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10'
                : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-200 '
            }`}
          >
            <div className="text-center">
              <p className="text-sm font-bold">Aesthetic ✨</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Puitis & tenang</p>
            </div>
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-500 font-bold">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg dark:shadow-none shadow-indigo-200 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
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
