"use client";

import { useState, useEffect } from "react";
import { HardDrive, Zap, BookOpen, BrainCircuit, RefreshCw, CheckCircle2, ChevronRight, MessageSquare, Save, History, Edit2, Trash2 } from "lucide-react";
import { syncGoogleDriveFolder, generateSKSSummary, generateBingeWatchPlan, saveLearningHistory, getLearningHistory, deleteLearningHistory, updateLearningHistoryTitle } from "@/app/actions/learning.actions";
import { LearningHistoryItem } from "@/types";
import { SksCanvas, BingeWatchCanvas } from "@/components/LearningCanvas";
import { useModal } from "@/components/ModalProvider";

export default function LearningPage() {
  const { showModal } = useModal();
  const [driveUrl, setDriveUrl] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedFolder, setSyncedFolder] = useState<any>(null);

  const [mode, setMode] = useState<"selection" | "sks" | "binge">("selection");
  const [isLoadingMode, setIsLoadingMode] = useState(false);

  // SKS State
  const [sksSummary, setSksSummary] = useState({ title: "", content: "" });

  // Binge State
  const [bingePlan, setBingePlan] = useState<{ courseTitle: string; episodes: any[] }>({ courseTitle: "", episodes: [] });

  // History State
  const [learningHistory, setLearningHistory] = useState<LearningHistoryItem[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<LearningHistoryItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const res = await getLearningHistory();
    if (res.success && res.data) setLearningHistory(res.data as LearningHistoryItem[]);
  };

  const handleSaveNote = async (title: string, type: string, content: any) => {
    setIsSaving(true);
    const res = await saveLearningHistory(syncedFolder.dbFolderId, title, type, content);
    if (res.success) {
      showModal({ title: "Berhasil", message: "Catatan berhasil disimpan ke History!", type: "success" });
      loadHistory();
    } else {
      showModal({ title: "Gagal Menyimpan", message: res.error || "Gagal Save", type: "error" });
    }
    setIsSaving(false);
  };

  const handleDeleteHistory = (id: string) => {
    showModal({
      title: "Hapus Catatan?",
      message: "Hapus catatan ini secara permanen?",
      type: "confirm",
      onConfirm: async () => {
        const res = await deleteLearningHistory(id);
        if (res.success) {
          loadHistory();
        } else {
          showModal({ title: "Gagal", message: res.error || "Gagal Hapus", type: "error" });
        }
      },
    });
  };

  const handleUpdateTitle = async (id: string) => {
    if (!editTitle.trim()) {
      setEditingId(null);
      return;
    }
    const res = await updateLearningHistoryTitle(id, editTitle);
    if (res.success) {
      loadHistory();
      setEditingId(null);
    } else {
      showModal({ title: "Gagal", message: res.error || "Gagal Update Title", type: "error" });
    }
  };

  const handleSyncDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveUrl) return;

    setIsSyncing(true);
    const res = await syncGoogleDriveFolder(driveUrl);
    if (res.success) {
      setSyncedFolder(res.data);
    }
    setIsSyncing(false);
  };

  const selectSKSMode = async () => {
    setMode("sks");
    setIsLoadingMode(true);
    const res = await generateSKSSummary(syncedFolder.dbFolderId);
    if (res.success && res.data) {
      setSksSummary(res.data);
    } else {
      showModal({ title: "Gagal AI", message: res.error || "Gagal Generate", type: "error" });
    }
    setIsLoadingMode(false);
  };

  const selectBingeMode = async () => {
    setMode("binge");
    setIsLoadingMode(true);
    const res = await generateBingeWatchPlan(syncedFolder.dbFolderId);
    if (res.success && res.data) {
      setBingePlan(res.data);
    } else {
      showModal({ title: "Gagal AI", message: res.error || "Gagal Generate", type: "error" });
    }
    setIsLoadingMode(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <BrainCircuit className="w-8 h-8 text-indigo-600" />
          Learning Hub
        </h1>
        <p className="text-sm text-gray-600 mt-2">Connect your materials and let AI become your personal tutor.</p>
      </header>

      {!syncedFolder ? (
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <HardDrive className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Connect Google Drive</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm">Paste link folder Google Drive kamu. DoJo bakal nge-scan PDF/Docs di dalamnya dan nyiapin vektor embedding biar kamu bisa belajar lebih gampang.</p>

          <form onSubmit={handleSyncDrive} className="max-w-md mx-auto flex gap-2">
            <input
              type="url"
              placeholder="https://drive.google.com/drive/folders/..."
              className="flex-1 px-4 text-black py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              value={driveUrl}
              onChange={(e) => setDriveUrl(e.target.value)}
              required
            />
            <button type="submit" disabled={isSyncing} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-70 flex items-center gap-2">
              {isSyncing ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Sync"}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-green-600 w-6 h-6" />
              <div>
                <h3 className="font-bold text-green-900">{syncedFolder.folderName}</h3>
                <p className="text-xs text-green-700">{syncedFolder.filesCount} files embedded and ready to learn!</p>
              </div>
            </div>
            <button
              onClick={() => {
                setSyncedFolder(null);
                setMode("selection");
              }}
              className="text-sm text-green-700 font-medium underline"
            >
              Change Folder
            </button>
          </div>

          {mode === "selection" && (
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              {/* SKS Mode Card */}
              <button onClick={selectSKSMode} className="text-left bg-white p-8 rounded-3xl border-2 border-transparent hover:border-yellow-400 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                <div className="w-14 h-14 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center mb-6 relative z-10">
                  <Zap className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 relative z-10">SKS Mode</h3>
                <p className="text-gray-500 leading-relaxed text-sm relative z-10">Sistem Kebut Semalam. AI ngerangkum SEMUA materi jadi satu kanvas praktis. Cocok buat review cepet sebelum ujian mulai.</p>
              </button>

              {/* Binge-Watch Mode Card */}
              <button onClick={selectBingeMode} className="text-left bg-white p-8 rounded-3xl border-2 border-transparent hover:border-indigo-400 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 relative z-10">
                  <BookOpen className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 relative z-10">Binge-Watch Mode</h3>
                <p className="text-gray-500 leading-relaxed text-sm relative z-10">Belajar santai ala nonton Netflix. Materi dipecah per-quarter. Bisa deep-dive diskusi bareng AI dan ngerjain quiz interaktif.</p>
              </button>
            </div>
          )}

          {/* SKS MODE UI */}
          {mode === "sks" && (
            <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-yellow-200">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                <Zap className="w-8 h-8 text-yellow-500" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{sksSummary.title || "SKS Summary Canvas"}</h2>
                  <p className="text-sm text-gray-500">Intisari dari seluruh dokumenmu</p>
                </div>
                <button onClick={() => setMode("selection")} className="ml-auto text-sm font-medium text-gray-500 hover:text-gray-900">
                  Back
                </button>
              </div>

              {isLoadingMode ? (
                <div className="flex flex-col items-center py-12">
                  <RefreshCw className="w-8 h-8 text-yellow-500 animate-spin mb-4" />
                  <p className="text-gray-500 font-medium">Merangkum jutaan kata untukmu...</p>
                </div>
              ) : (
                <>
                  <SksCanvas content={sksSummary.content} />

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => handleSaveNote(sksSummary.title || `${syncedFolder.folderName} - SKS Summary`, "sks", sksSummary.content)}
                      disabled={isSaving}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-70"
                    >
                      {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      Simpan Catatan
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* BINGE-WATCH MODE UI */}
          {mode === "binge" && (
            <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-indigo-200">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                <BookOpen className="w-8 h-8 text-indigo-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{bingePlan.courseTitle || "Binge-Watch Roadmap"}</h2>
                  <p className="text-sm text-gray-500">Selesaikan quarter demi quarter</p>
                </div>
                <button onClick={() => setMode("selection")} className="ml-auto text-sm font-medium text-gray-500 hover:text-gray-900">
                  Back
                </button>
              </div>

              {isLoadingMode ? (
                <div className="flex flex-col items-center py-12">
                  <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
                  <p className="text-gray-500 font-medium">Menyusun episode belajarmu...</p>
                </div>
              ) : (
                <>
                  <BingeWatchCanvas episodes={bingePlan.episodes} folderId={syncedFolder?.dbFolderId || null} />

                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={() => handleSaveNote(bingePlan.courseTitle || `${syncedFolder.folderName} - Binge-Watch Plan`, "binge", bingePlan.episodes)}
                      disabled={isSaving}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-70"
                    >
                      {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      Simpan Roadmap
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Learning History Section */}
      <div className="space-y-4 pt-8 border-t border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <History className="w-6 h-6 text-indigo-600" /> Learning History
        </h2>

        {!learningHistory || learningHistory.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada catatan</h3>
            <p className="text-sm text-gray-500">Gunakan SKS atau Binge-Watch mode lalu simpan hasilnya ke sini!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {learningHistory.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative group">
                <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-2 bg-white pl-2">
                  <button
                    onClick={() => {
                      setEditingId(item.id);
                      setEditTitle(item.title);
                    }}
                    className="text-gray-400 hover:text-indigo-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteHistory(item.id)} className="text-gray-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div
                  className="flex flex-col items-start mb-2 pr-12 cursor-pointer"
                  onClick={() => {
                    if (editingId !== item.id) setSelectedHistory(item);
                  }}
                >
                  <span className={`mb-2 text-xs px-2 py-1 rounded-full font-bold uppercase ${item.type === "sks" ? "bg-yellow-100 text-yellow-700" : "bg-indigo-100 text-indigo-700"}`}>{item.type}</span>

                  {editingId === item.id ? (
                    <div className="flex gap-2 w-full mt-1">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm font-bold text-gray-900 outline-none focus:border-indigo-500"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdateTitle(item.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                      />
                      <button onClick={() => handleUpdateTitle(item.id)} className="text-xs bg-indigo-600 text-white px-3 rounded font-medium hover:bg-indigo-700 transition-colors">
                        Save
                      </button>
                    </div>
                  ) : (
                    <h3 className="font-bold text-gray-900 line-clamp-2">{item.title}</h3>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">Disimpan pada: {new Date(item.created_at).toLocaleDateString("id-ID")}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View History Modal */}
      {selectedHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedHistory(null)}>
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedHistory.title}</h2>
                <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mt-1">{selectedHistory.type === "sks" ? "SKS Summary" : "Binge-Watch Roadmap"}</p>
              </div>
              <button onClick={() => setSelectedHistory(null)} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 w-10 h-10 flex items-center justify-center rounded-full transition-colors">
                ✕
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto bg-gray-50/50">
              {selectedHistory.type === "sks" ? (
                <SksCanvas content={typeof selectedHistory.content === "string" ? selectedHistory.content : JSON.stringify(selectedHistory.content)} />
              ) : (
                <BingeWatchCanvas episodes={typeof selectedHistory.content === "string" ? JSON.parse(selectedHistory.content) : selectedHistory.content} folderId={selectedHistory.folder_id || undefined} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
