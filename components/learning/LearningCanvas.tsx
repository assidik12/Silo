"use client";

import { useState, useRef, useEffect } from "react";
import { BookOpen, MessageSquare, ChevronRight, Send, Loader2, Calendar, Edit3, Check } from "lucide-react";
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
}

export function BingeWatchCanvas({ episodes, folderId, courseTitle, onEpisodesChange }: BingeWatchCanvasProps) {
  const [activeQuarter, setActiveQuarter] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
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
  const scrollRef = useRef<HTMLDivElement>(null);

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

  if (!episodes || episodes.length === 0) return null;

  const activeEpisode = episodes.find((p) => p.id === activeQuarter);

  return (
    <div className={isExpanded ? "fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-900 md:p-8 flex flex-col overflow-hidden md:gap-6" : "space-y-6"}>
      <div className={`flex items-center justify-between bg-white dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-800 shrink-0 shadow-sm z-10 ${isExpanded ? "rounded-none md:rounded-2xl border-x-0 border-t-0 md:border-x md:border-t" : "rounded-2xl"}`}>
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Learning Schedule</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{episodes.length} sessions generated by AI</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleSyncToCalendar}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-slate-900/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-all shadow-sm dark:shadow-none disabled:opacity-50"
          >
            {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
            <span className="hidden sm:inline">{isSyncing ? "Syncing..." : "Sync to Calendar"}</span>
          </button>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-center p-2 bg-white dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-all shadow-sm dark:shadow-none"
            title={isExpanded ? "Minimize" : "Maximize"}
          >
            {isExpanded ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
            )}
          </button>
        </div>
      </div>

      <div className={`flex flex-col md:grid md:grid-cols-3 gap-0 md:gap-6 ${isExpanded ? "flex-1 min-h-0" : ""}`}>
        <div className={`md:col-span-1 flex flex-row md:flex-col gap-3 md:border-r border-gray-100 dark:border-slate-800 p-4 md:p-0 md:pr-4 shrink-0 bg-slate-50 dark:bg-slate-900 border-b md:border-b-0 overflow-x-auto md:overflow-x-hidden ${isExpanded ? "md:overflow-y-auto md:pr-2 custom-scrollbar" : ""}`}>
          {episodes.map((plan, idx) => (
            <button
              key={plan.id || idx}
              onClick={() => {
                setActiveQuarter(plan.id);
                setIsEditingDesc(false);
                setIsDescExpanded(false);
              }}
              className={`min-w-[200px] md:min-w-0 md:w-full shrink-0 text-left p-3 md:p-4 rounded-2xl border transition-all ${
                activeQuarter === plan.id ? "bg-indigo-600 text-white border-indigo-600 shadow-md dark:shadow-none transform md:scale-[1.02]" : "bg-white dark:bg-slate-900/50 border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-200 hover:border-indigo-300 dark:hover:border-indigo-500"
              }`}
            >
              <p className={`text-[10px] md:text-xs font-bold uppercase tracking-wider mb-0.5 md:mb-1 ${activeQuarter === plan.id ? "text-indigo-200" : "text-gray-400"}`}>Episode {idx + 1}</p>
              <h4 className="font-bold text-sm md:text-base line-clamp-2 md:line-clamp-none leading-tight">{plan.title}</h4>
            </button>
          ))}
        </div>

        <div className="md:col-span-2 flex-1 min-h-0 flex flex-col bg-slate-50 dark:bg-slate-900">
          {activeQuarter ? (
            <div className={`${!isExpanded ? "h-[600px] rounded-2xl border" : "flex-1 min-h-0 rounded-none md:rounded-2xl border-none md:border"} flex flex-col bg-gray-50 dark:bg-slate-900/50 border-gray-200 dark:border-slate-800 overflow-hidden`}>
              <div className="p-6 bg-white dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-800 shrink-0 group relative">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{activeEpisode?.title}</h3>
                
                {isEditingDesc ? (
                  <div className="mt-2 space-y-2">
                    <textarea 
                      value={tempDesc}
                      onChange={(e) => setTempDesc(e.target.value)}
                      className="w-full p-3 rounded-xl border-2 border-indigo-200 focus:ring-4 focus:ring-indigo-50 outline-none text-sm bg-slate-50 dark:bg-slate-800/50 min-h-[100px]"
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setIsEditingDesc(false)} className="text-xs font-bold text-slate-500 dark:text-slate-400">Cancel</button>
                      <button onClick={handleSaveDesc} className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Save Description</button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <p className={`text-gray-600 dark:text-slate-300 mt-2 text-sm leading-relaxed ${isDescExpanded ? "" : "line-clamp-2 pr-8"}`}>
                      {activeEpisode?.description}
                    </p>
                    {activeEpisode?.description && activeEpisode.description.length > 120 && (
                      <button 
                        onClick={() => setIsDescExpanded(!isDescExpanded)} 
                        className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 mt-1 tracking-wider uppercase"
                      >
                        {isDescExpanded ? "Show Less" : "Show More"}
                      </button>
                    )}
                    <button 
                      onClick={() => { setTempDesc(activeEpisode?.description || ""); setIsEditingDesc(true); }}
                      className="absolute top-0 right-0 p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {!chatActive[activeQuarter] ? (
                <div className="flex-1 p-6 flex flex-col items-center justify-center text-center overflow-y-auto">
                  <div className="w-20 h-20 mb-4 rounded-full overflow-hidden border-4 border-indigo-50 shadow-md">
                     <img src="/assets/mascots/neko_greeting_time_1781150921927.png" alt="Neko" className="w-full h-full object-cover" />
                  </div>
                  <h4 className="font-bold text-gray-700 dark:text-slate-200 mb-2">Deep Dive & Discuss with Neko</h4>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 max-w-sm">Tanya hal yang belum jelas, minta contoh kasus, atau generate quiz dari materi quarter ini.</p>
                  <button
                    onClick={() => handleStartChat(activeQuarter)}
                    disabled={isLoadingChat}
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-bold shadow-md dark:shadow-none hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-75"
                  >
                    {isLoadingChat ? <Loader2 className="w-4 h-4 animate-spin" /> : "Start Chat"}
                    {!isLoadingChat && <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col flex-1 overflow-hidden">
                  <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                    {(chats[activeQuarter] || []).map((msg, i) => (
                      <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        {msg.role === "ai" && (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-indigo-50 border border-indigo-100 mt-1">
                            <img src="/assets/mascots/neko_ask_task_1781150994594.png" alt="Neko" className="w-full h-full object-contain p-0.5" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.role === "user" ? "bg-indigo-600 text-white rounded-br-none" : "bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-slate-200 rounded-tl-none shadow-sm dark:shadow-none"}`}
                          dangerouslySetInnerHTML={formatMessage(msg.content)}
                        />
                      </div>
                    ))}
                    {isLoadingChat && (
                      <div className="flex justify-start gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-indigo-50 border border-indigo-100 mt-1">
                          <img src="/assets/mascots/neko_ask_task_1781150994594.png" alt="Neko" className="w-full h-full object-contain p-0.5 animate-pulse" />
                        </div>
                        <div className="bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-400 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm dark:shadow-none flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                          <span className="text-xs font-medium">Neko lagi mikir...</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-900/50 border-t border-gray-200 dark:border-slate-800 shrink-0">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder="Tanya materi ini..."
                        className="flex-1 rounded-full border text-black dark:text-white border-gray-300 dark:border-slate-700 dark:bg-slate-800/50 dark:placeholder-slate-400 px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isLoadingChat}
                        className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                      >
                        <Send className="w-4 h-4 ml-[-2px]" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl">
              <BookOpen className="w-12 h-12 mb-3 text-gray-300 dark:text-slate-600" />
              <p className="font-medium">Pilih episode di samping untuk mulai.</p>
            </div>
          )}
        </div>
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
    </div>
  );
}
