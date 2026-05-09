import { useState, useRef, useEffect } from "react";
import { BookOpen, MessageSquare, ChevronRight, Send, Loader2 } from "lucide-react";
import { chatWithTutor, getQuarterChatHistory } from "@/app/actions/learning.actions";
import { Episode } from "@/types";

export function SksCanvas({ content }: { content: string }) {
  if (!content) return null;
  return (
    <div
      className="prose prose-indigo max-w-none text-gray-800 bg-yellow-50/50 p-6 rounded-2xl border border-yellow-100 font-sans text-sm leading-relaxed"
      dangerouslySetInnerHTML={{
        __html: content
          .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-6 mb-2 text-indigo-900">$1</h3>')
          .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-8 mb-3 text-indigo-900">$1</h2>')
          .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4 text-indigo-900">$1</h1>')
          .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-gray-900">$1</strong>')
          .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
          .replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc mb-1">$1</li>')
          .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc mb-1">$1</li>')
          .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal mb-1">$1</li>')
          .replace(/\n/g, "<br/>"),
      }}
    />
  );
}

export function BingeWatchCanvas({ episodes, folderId }: { episodes: Episode[]; folderId?: string }) {
  const [activeQuarter, setActiveQuarter] = useState<string | null>(null);

  const [chats, setChats] = useState<Record<string, { role: "user" | "ai"; content: string }[]>>({});
  const [chatActive, setChatActive] = useState<Record<string, boolean>>({});
  const [inputValue, setInputValue] = useState("");
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
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
    }
  };

  const formatMessage = (text: string) => {
    return {
      __html: text
        .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold">$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
        .replace(/\n/g, "<br/>"),
    };
  };

  if (!episodes || episodes.length === 0) return null;

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-3 border-r border-gray-100 pr-4">
        {episodes.map((plan, idx) => (
          <button
            key={plan.id || idx}
            onClick={() => setActiveQuarter(plan.id)}
            className={`w-full text-left p-4 rounded-2xl border transition-all ${
              activeQuarter === plan.id ? "bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-[1.02]" : "bg-white border-gray-200 text-gray-700 hover:border-indigo-300"
            }`}
          >
            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${activeQuarter === plan.id ? "text-indigo-200" : "text-gray-400"}`}>Episode {idx + 1}</p>
            <h4 className="font-bold">{plan.title}</h4>
          </button>
        ))}
      </div>

      <div className="md:col-span-2">
        {activeQuarter ? (
          <div className="h-[600px] flex flex-col bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-6 bg-white border-b border-gray-200 shrink-0">
              <h3 className="text-xl font-bold text-gray-900">{episodes.find((p) => p.id === activeQuarter)?.title}</h3>
              <p className="text-gray-600 mt-2 text-sm leading-relaxed">{episodes.find((p) => p.id === activeQuarter)?.description}</p>
            </div>

            {!chatActive[activeQuarter] ? (
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center overflow-y-auto">
                <MessageSquare className="w-12 h-12 text-indigo-200 mb-4" />
                <h4 className="font-bold text-gray-700 mb-2">Deep Dive & Discuss</h4>
                <p className="text-sm text-gray-500 mb-6 max-w-sm">Tanya hal yang belum jelas, minta contoh kasus, atau generate quiz dari materi quarter ini.</p>
                <button
                  onClick={() => handleStartChat(activeQuarter)}
                  disabled={isLoadingChat}
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-bold shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-75"
                >
                  {isLoadingChat ? <Loader2 className="w-4 h-4 animate-spin" /> : "Start Chat with AI"}
                  {!isLoadingChat && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            ) : (
              <div className="flex flex-col flex-1 overflow-hidden">
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                  {(chats[activeQuarter] || []).map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.role === "user" ? "bg-indigo-600 text-white rounded-br-none" : "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm"}`}
                        dangerouslySetInnerHTML={formatMessage(msg.content)}
                      />
                    </div>
                  ))}
                  {isLoadingChat && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 text-gray-400 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                        <span className="text-xs font-medium">Bentar, mikir dulu...</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-white border-t border-gray-200 shrink-0">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Tanya materi ini..."
                      className="flex-1 rounded-full border text-black border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
          <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
            <BookOpen className="w-12 h-12 mb-3 text-gray-300" />
            <p className="font-medium">Pilih quarter di samping untuk mulai.</p>
          </div>
        )}
      </div>
    </div>
  );
}
