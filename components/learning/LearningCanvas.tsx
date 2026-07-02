"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { BookOpen, MessageSquare, ChevronRight, ChevronLeft, Send, Loader2, Calendar, Edit3, Check } from "lucide-react";
import { chatWithTutor, getQuarterChatHistory, syncLearningPlanToCalendar } from "@/app/actions/learning.actions";
import { Episode } from "@/types";
import FeedbackModal from "../feedback/FeedbackModal";
import { useModal } from "../providers/ModalProvider";

interface SksCanvasProps {
  content: string;
  onChange?: (newContent: string) => void;
}

export function SksCanvas({ content, onChange }: SksCanvasProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localContent, setLocalContent] = useState(content);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  if (!content) return null;

  const handleSave = () => {
    setIsEditing(false);
    if (onChange) onChange(localContent);
  };

  return (
    <div className="relative group">
      {!isEditing && (
        <button 
          onClick={() => setIsEditing(true)}
          className="absolute top-4 right-4 p-2 bg-white dark:bg-slate-900/50/80 hover:bg-white dark:bg-slate-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg shadow-sm dark:shadow-none border border-indigo-100 opacity-0 group-hover:opacity-100 transition-all z-10"
          title="Edit Catatan"
        >
          <Edit3 className="w-4 h-4" />
        </button>
      )}

      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={localContent}
            onChange={(e) => setLocalContent(e.target.value)}
            className="w-full min-h-[400px] p-6 rounded-2xl border-2 text-slate-900 dark:text-white border-indigo-300 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 outline-none font-mono text-sm leading-relaxed bg-white dark:bg-slate-900/50"
          />
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => { setIsEditing(false); setLocalContent(content); }}
              className="px-4 py-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 "
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md dark:shadow-none flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div
          className="prose prose-indigo max-w-none text-gray-800 dark:text-slate-200 bg-yellow-50/50 dark:bg-yellow-900/10 p-6 rounded-2xl border border-yellow-100 dark:border-yellow-900/20 font-sans text-sm leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: localContent
              .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-6 mb-2 text-indigo-900 dark:text-indigo-300">$1</h3>')
              .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-8 mb-3 text-indigo-900 dark:text-indigo-300">$2</h2>')
              .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4 text-indigo-900 dark:text-indigo-300">$1</h1>')
              .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>')
              .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
              .replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc mb-1">$1</li>')
              .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc mb-1">$1</li>')
              .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal mb-1">$1</li>')
              .replace(/\n/g, "<br/>"),
          }}
        />
      )}
    </div>
  );
}

interface BingeWatchCanvasProps {
  episodes: Episode[];
  folderId?: string;
  courseTitle?: string;
  onEpisodesChange?: (newEpisodes: Episode[]) => void;
  onClose?: () => void;
  onSave?: () => void;
}

export function BingeWatchCanvas({ episodes, folderId, courseTitle, onEpisodesChange, onClose, onSave }: BingeWatchCanvasProps) {
  const [activeQuarter, setActiveQuarter] = useState<string | null>(null);
  const { showModal } = useModal();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [tempDesc, setTempDesc] = useState("");
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const [chats, setChats] = useState<Record<string, { role: "user" | "ai"; content: string }[]>>({});
  const [chatActive, setChatActive] = useState<Record<string, boolean>>({});
  const [inputValue, setInputValue] = useState("");
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [aiMessageCount, setAiMessageCount] = useState(0);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chats, activeQuarter]);

  useEffect(() => {
    const loadChatHistory = async () => {
      if (activeQuarter && !chats[activeQuarter] && !isLoadingHistory) {
        setIsLoadingHistory(true);
        const { data } = await getQuarterChatHistory(folderId || null, activeQuarter);
        if (data && data.length > 0) {
          setChats((prev) => ({ ...prev, [activeQuarter]: data }));
          setChatActive((prev) => ({ ...prev, [activeQuarter]: true }));
        }
        setIsLoadingHistory(false);
      }
    };
    loadChatHistory();
  }, [activeQuarter, folderId]);

  const handleStartChat = async (quarterId: string) => {
    setChatActive((prev) => ({ ...prev, [quarterId]: true }));

    if (!chats[quarterId] || chats[quarterId].length === 0) {
      const quarter = episodes.find((p) => p.id === quarterId);
      if (!quarter) return;

      setIsLoadingChat(true);
      const res = await chatWithTutor(folderId || null, quarterId, quarter.title, quarter.description, "Gue siap belajar materi ini", []);
      setIsLoadingChat(false);

      if (res.success && res.data) {
        setChats((prev) => ({
          ...prev,
          [quarterId]: [{ role: "ai", content: res.data || "" }],
        }));
      } else {
        setChats((prev) => ({
          ...prev,
          [quarterId]: [{ role: "ai", content: "Sorry, gue lagi ada kendala jaringan nih. Coba lagi bentar ya!" }],
        }));
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !activeQuarter) return;

    const usermsg = inputValue.trim();
    setInputValue("");

    const newHistory = [...(chats[activeQuarter] || []), { role: "user" as const, content: usermsg }];

    setChats((prev) => ({
      ...prev,
      [activeQuarter]: newHistory,
    }));

    const quarter = episodes.find((p) => p.id === activeQuarter);
    if (!quarter) return;

    setIsLoadingChat(true);
    const res = await chatWithTutor(folderId || null, activeQuarter, quarter.title, quarter.description, usermsg, chats[activeQuarter] || []);
    setIsLoadingChat(false);

    if (res.success && res.data) {
      setChats((prev) => ({
        ...prev,
        [activeQuarter]: [...newHistory, { role: "ai", content: res.data || "" }],
      }));
      
      const newCount = aiMessageCount + 1;
      setAiMessageCount(newCount);
      
      if (newCount === 3 && !feedbackGiven) {
        setTimeout(() => setShowFeedbackModal(true), 1500);
      }
    } else {
      setChats((prev) => ({
        ...prev,
        [activeQuarter]: [...newHistory, { role: "ai", content: `*(Sistem)* ${res.error || "Gagal mendapatkan respon dari Neko."}` }],
      }));
    }
  };

  const handleSaveDesc = () => {
    if (!activeQuarter || !onEpisodesChange) return;
    const newEpisodes = episodes.map(ep => 
      ep.id === activeQuarter ? { ...ep, description: tempDesc } : ep
    );
    onEpisodesChange(newEpisodes);
    setIsEditingDesc(false);
  };

  const handleSyncToCalendar = async () => {
    if (!courseTitle || episodes.length === 0) return;
    
    setIsSyncing(true);
    const res = await syncLearningPlanToCalendar(courseTitle, episodes);
    if (res.success) {
      showModal({
        title: "Sync Berhasil!",
        message: "Jadwal belajar kamu udah masuk ke Google Calendar. Cek sekarang biar gak lupa!",
        type: "success"
      });
    } else {
      showModal({
        title: "Sync Gagal",
        message: res.error || "Gagal sinkron kalender",
        type: "error"
      });
    }
    setIsSyncing(false);
  };

  const formatMessage = (text: string) => {
    let formatted = text
      .replace(/^### (.*$)/gim, '<h3 class="text-base font-bold mt-4 mb-1 text-indigo-900 dark:text-indigo-300">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold mt-4 mb-2 text-indigo-900 dark:text-indigo-300">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold mt-5 mb-2 text-indigo-900 dark:text-indigo-300">$1</h1>')
      .replace(/^(\d+\.) (.*$)/gim, '<div class="ml-1 mt-2 flex gap-2"><span class="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">$1</span><span>$2</span></div>')
      .replace(/^[\*-] (.*$)/gim, '<div class="ml-1 mt-2 flex gap-2"><span class="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">•</span><span>$1</span></div>')
      .replace(/\*\*([\s\S]*?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-slate-100">$1</strong>')
      .replace(/\*([^\n\*]*?)\*/g, '<em class="italic text-gray-800 dark:text-slate-200">$1</em>')
      .replace(/\n\n/g, '<div class="h-3"></div>')
      .replace(/\n/g, '<br/>')
      .replace(/(<\/h[1-3]>|<\/div>|<div class="h-3"><\/div>)\s*<br\/>/g, '$1');

    return {
      __html: `<div class="leading-relaxed text-[15px] tracking-wide">${formatted}</div>`
    };
  };

  if (!episodes || episodes.length === 0 || !mounted) return null;

  const activeEpisode = episodes.find((p) => p.id === activeQuarter);

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-900 flex flex-col md:flex-row overflow-hidden animate-fade-in">
      {/* Sidebar (Roadmap) */}
      <div className={`md:w-[350px] border-r border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 flex-col overflow-y-auto ${activeQuarter ? 'hidden md:flex' : 'flex'} w-full shrink-0 relative custom-scrollbar`}>
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex items-center gap-3 bg-white dark:bg-slate-900 sticky top-0 z-10 shrink-0 shadow-sm">
          {onClose && (
            <button onClick={onClose} className="p-2 -ml-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="min-w-0">
            <h2 className="font-bold text-gray-900 dark:text-white truncate">{courseTitle || "Binge-Watch Roadmap"}</h2>
            <p className="text-xs text-slate-500">{episodes.length} sessions generated by AI</p>
          </div>
        </div>

        {/* Sidebar List */}
        <div className="flex-1 p-4 space-y-3">
          {episodes.map((plan, idx) => (
            <button
              key={plan.id || idx}
              onClick={() => {
                setActiveQuarter(plan.id);
                setIsEditingDesc(false);
                setIsDescExpanded(false);
              }}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                activeQuarter === plan.id ? "bg-indigo-600 text-white border-indigo-600 shadow-md dark:shadow-none" : "bg-white dark:bg-slate-900/50 border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-200 hover:border-indigo-300 dark:hover:border-indigo-500"
              }`}
            >
              <p className={`text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1 ${activeQuarter === plan.id ? "text-indigo-200" : "text-gray-400"}`}>Episode {idx + 1}</p>
              <h4 className="font-bold text-sm md:text-base leading-tight line-clamp-2">{plan.title}</h4>
            </button>
          ))}
        </div>

        {/* Sidebar Footer Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 sticky bottom-0 shrink-0 space-y-2">
          {onSave && (
            <button 
              onClick={onSave}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Simpan ke History</span>
            </button>
          )}
          <button 
            onClick={handleSyncToCalendar}
            disabled={isSyncing}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 rounded-xl text-sm font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all disabled:opacity-50"
          >
            {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
            <span>{isSyncing ? "Syncing..." : "Sync to Calendar"}</span>
          </button>
        </div>
      </div>

      {/* Main Chat Room */}
      <div className={`flex-1 min-w-0 flex-col bg-white dark:bg-slate-900 ${!activeQuarter ? 'hidden md:flex' : 'flex'} relative h-full`}>
        {activeQuarter ? (
          <>
            {/* Chat Header */}
            <div className="p-4 md:p-6 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-2 shrink-0 relative z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveQuarter(null)} 
                  className="md:hidden p-1.5 -ml-1.5 text-slate-500 hover:text-indigo-600 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white pr-8 md:pr-0 leading-tight">{activeEpisode?.title}</h3>
                
                <button 
                  onClick={() => { setTempDesc(activeEpisode?.description || ""); setIsEditingDesc(true); }}
                  className="absolute top-4 md:top-6 right-4 md:right-6 p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              {isEditingDesc ? (
                <div className="mt-2 space-y-2">
                  <textarea 
                    value={tempDesc}
                    onChange={(e) => setTempDesc(e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-indigo-200 focus:ring-4 focus:ring-indigo-50 outline-none text-sm bg-slate-50 dark:bg-slate-800/50 min-h-[100px]"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setIsEditingDesc(false)} className="text-xs font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                    <button onClick={handleSaveDesc} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Save Description</button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className={`text-gray-600 dark:text-slate-300 text-sm leading-relaxed ${isDescExpanded ? "" : "line-clamp-2 pr-10"}`}>
                    {activeEpisode?.description}
                  </p>
                  {activeEpisode?.description && activeEpisode.description.length > 120 && (
                    <button 
                      onClick={() => setIsDescExpanded(!isDescExpanded)} 
                      className="text-[10px] md:text-xs font-bold text-indigo-500 hover:text-indigo-600 mt-1 tracking-wider uppercase"
                    >
                      {isDescExpanded ? "Show Less" : "Show More"}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Chat Messages */}
            {!chatActive[activeQuarter] ? (
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center overflow-y-auto">
                <div className="w-24 h-24 mb-4 rounded-full overflow-hidden border-4 border-indigo-50 shadow-md">
                   <img src="/assets/mascots/neko_greeting_time_1781150921927.png" alt="Neko" className="w-full h-full object-cover" />
                </div>
                <h4 className="font-bold text-xl text-gray-700 dark:text-slate-200 mb-2">Deep Dive bareng Neko</h4>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-8 max-w-sm">Tanya hal yang belum jelas, minta contoh kasus, atau generate quiz dari materi quarter ini.</p>
                <button
                  onClick={() => handleStartChat(activeQuarter)}
                  disabled={isLoadingChat}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-75"
                >
                  {isLoadingChat ? <Loader2 className="w-5 h-5 animate-spin" /> : "Mulai Diskusi"}
                  {!isLoadingChat && <ChevronRight className="w-5 h-5" />}
                </button>
              </div>
            ) : (
              <div className="flex flex-col flex-1 overflow-hidden relative">
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 pb-28 md:pb-24">
                  {(chats[activeQuarter] || []).map((msg, i) => (
                    <div key={i} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"} max-w-4xl mx-auto w-full`}>
                      {msg.role === "ai" && (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-indigo-50 border border-indigo-100 mt-1">
                          <img src="/assets/mascots/neko_ask_task_1781150994594.png" alt="Neko" className="w-full h-full object-contain p-1" />
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] md:max-w-[75%] px-5 py-4 text-[15px] ${msg.role === "user" ? "bg-indigo-600 text-white rounded-3xl rounded-br-sm shadow-sm" : "bg-gray-50 dark:bg-slate-800/50 text-gray-800 dark:text-slate-200 rounded-3xl rounded-tl-sm border border-gray-100 dark:border-slate-700"}`}
                        dangerouslySetInnerHTML={formatMessage(msg.content)}
                      />
                    </div>
                  ))}
                  {isLoadingChat && (
                    <div className="flex justify-start gap-4 max-w-4xl mx-auto w-full">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-indigo-50 border border-indigo-100 mt-1">
                        <img src="/assets/mascots/neko_ask_task_1781150994594.png" alt="Neko" className="w-full h-full object-contain p-1 animate-pulse" />
                      </div>
                      <div className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 border border-gray-100 dark:border-slate-700 rounded-3xl rounded-tl-sm px-5 py-4 flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                        <span className="text-sm font-medium">Neko lagi ngetik...</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Chat Input Fixed at Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-white via-white to-transparent dark:from-slate-900 dark:via-slate-900 pointer-events-none flex justify-center">
                  <div className="w-full max-w-4xl flex gap-2 pointer-events-auto shadow-xl dark:shadow-none rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-2 relative">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Tanya soal materi ini, minta contoh, atau quiz..."
                      className="flex-1 bg-transparent px-4 py-2 text-[15px] focus:outline-none text-gray-900 dark:text-white dark:placeholder-slate-400"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoadingChat}
                      className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-indigo-700 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shrink-0"
                    >
                      <Send className="w-5 h-5 ml-[-2px]" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 dark:bg-slate-900/50">
            <BookOpen className="w-16 h-16 mb-4 text-gray-300 dark:text-slate-700" />
            <p className="font-medium text-lg">Pilih episode dari roadmap untuk memulai.</p>
          </div>
        )}
      </div>

      <FeedbackModal 
        isOpen={showFeedbackModal}
        onClose={() => {
          setShowFeedbackModal(false);
          setFeedbackGiven(true);
        }}
        type="ai_tutor"
        title="AI Tutor-nya Ngebantu?"
        description="Gimana penjelasan AI sejauh ini? Berasa belajar bareng temen atau kaku kayak buku teks?"
        metadata={{ folder_id: folderId, quarter_id: activeQuarter }}
      />
    </div>,
    document.body
  );
}
