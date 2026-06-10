'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Brain, Send, MessageSquareText, RefreshCw } from 'lucide-react';
import { askDojoBot } from '@/app/actions/chatbot.actions';

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'faq' | 'chat'>('faq');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  // Chat state
  const [messages, setMessages] = useState<{role: 'user'|'bot', text: string}[]>([
    { role: 'bot', text: 'Hai! Gue DoJo Bot. Ada yang pengen lo tanyain seputar cara pakai DoJo?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'chat' && isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userText = inputMessage.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInputMessage('');
    setIsLoading(true);

    const res = await askDojoBot(userText);
    
    setMessages(prev => [
      ...prev, 
      { role: 'bot', text: res.success ? (res.data || '') : `Error: ${res.error}` }
    ]);
    
    setIsLoading(false);
  };

  const faqs = [
    { q: "Apa itu DoJo?", a: "DoJo adalah platform gamifikasi produktivitas untuk membantumu fokus belajar dan mengerjakan tugas layaknya bermain game." },
    { q: "Bagaimana cara dapat XP?", a: "Selesaikan tugas (Task), gunakan Pomodoro timer, atau selesaikan modul di Learning Hub untuk mendapatkan XP dan naik level." },
    { q: "Apa gunanya SKS Mode?", a: "SKS Mode menggunakan AI untuk merangkum otomatis materi dokumen/PDF dari Google Drive kamu ke dalam satu kanvas ringkas." },
    { q: "Kenapa Streak saya hilang?", a: "Streak akan reset jika kamu tidak menyelesaikan minimal 1 tugas dalam 1 hari. Tetap konsisten!" }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white dark:bg-slate-900/95 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 w-80 md:w-96 max-h-[85vh] flex flex-col transform transition-all animate-fade-in backdrop-blur-md overflow-hidden">
          
          {/* Header */}
          <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-indigo-600 dark:bg-indigo-700 text-white flex flex-col shrink-0">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold flex items-center gap-2">
                <Brain className="w-5 h-5" />
                DoJo Assistant
              </h4>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors bg-black/10 rounded-full p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex bg-indigo-800/50 p-1 rounded-lg">
              <button 
                onClick={() => setActiveTab('faq')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${activeTab === 'faq' ? 'bg-white text-indigo-700 shadow-sm' : 'text-white/80 hover:text-white'}`}
              >
                Quick FAQs
              </button>
              <button 
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors flex justify-center items-center gap-1 ${activeTab === 'chat' ? 'bg-white text-indigo-700 shadow-sm' : 'text-white/80 hover:text-white'}`}
              >
                <MessageSquareText className="w-3 h-3" /> Chatbot AI
              </button>
            </div>
          </div>
          
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col bg-gray-50/50 dark:bg-slate-900/50">
            
            {/* FAQ TAB */}
            {activeTab === 'faq' && (
              <div className="p-4 space-y-3">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full text-left px-4 py-3 flex justify-between items-center text-sm font-semibold text-gray-800 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <span className="pr-4 leading-tight">{faq.q}</span>
                      <span className={`text-indigo-500 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    <div className={`px-4 text-xs text-gray-600 dark:text-slate-400 transition-all duration-300 overflow-hidden ${openFaq === index ? 'max-h-40 py-3 border-t border-gray-100 dark:border-slate-700' : 'max-h-0 py-0'}`}>
                      {faq.a}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CHAT TAB */}
            {activeTab === 'chat' && (
              <div className="flex flex-col h-full min-h-[300px]">
                <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                        msg.role === 'user' 
                          ? 'bg-indigo-600 text-white rounded-tr-sm' 
                          : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-slate-200 rounded-tl-sm shadow-sm'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                        <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                
                <div className="p-3 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2 relative">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Tanya DoJo Bot..."
                      className="flex-1 bg-gray-100 dark:bg-slate-800 border-none rounded-full pl-4 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white"
                      disabled={isLoading}
                    />
                    <button 
                      type="submit" 
                      disabled={!inputMessage.trim() || isLoading}
                      className="absolute right-1.5 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 text-white p-3.5 rounded-full shadow-lg dark:shadow-none hover:bg-indigo-700 transition-transform hover:scale-105 flex items-center justify-center animate-bounce-soft"
          title="Bantuan & AI Bot"
        >
          <Brain className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
