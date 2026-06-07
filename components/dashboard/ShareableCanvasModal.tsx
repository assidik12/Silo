'use client';

import { useRef, useState } from 'react';
import * as htmlToImage from 'html-to-image';
import { Camera, X, Download, Link as LinkIcon, Share2 } from 'lucide-react';

interface ShareableCanvasProps {
  userId: string;
  name: string;
  streak: number;
  xp: number;
}

export default function ShareableCanvasModal({ userId, name, streak, xp }: ShareableCanvasProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await htmlToImage.toJpeg(canvasRef.current, { quality: 0.95, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `dojo-progress-${name}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
    }
    setDownloading(false);
  };

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/share/${userId}` : '';

  const handleShareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name}'s DoJo Stats`,
          text: `Check out my productivity streak on DoJo! Can you beat my ${streak} days streak? 🔥`,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link profile berhasil disalin! Paste di Bio atau Story IG kamu.');
      } catch (err) {
        console.error('Failed to copy', err);
      }
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 py-3 rounded-2xl shadow-sm transition-transform hover:scale-105 border border-pink-400/30"
      >
        <Camera className="w-5 h-5" />
        <span className="font-bold text-sm tracking-wide">Flex Progress</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 z-10">
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold mb-4 text-center text-gray-800 dark:text-white">Flex Your Progress! 🔥</h3>

            {/* The Canvas (IG Story Aspect Ratio 9:16 approx) */}
            <div 
              ref={canvasRef} 
              className="w-full aspect-[9/16] rounded-2xl bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 relative overflow-hidden flex flex-col items-center justify-center text-white p-8 shadow-inner"
            >
              {/* Aesthetic Background Elements */}
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-pink-500 rounded-full mix-blend-screen filter blur-[80px] opacity-60"></div>
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500 rounded-full mix-blend-screen filter blur-[80px] opacity-60"></div>

              <div className="z-10 flex flex-col items-center w-full h-full justify-between py-6">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2 rounded-full">
                  <span className="font-mono text-xs tracking-widest text-indigo-200 uppercase">DoJo App</span>
                </div>
                
                <div className="text-center w-full">
                  <h2 className="text-4xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-purple-300 text-center">
                    {name}'s Stats
                  </h2>
                  <p className="text-indigo-200 mb-10 font-medium tracking-wide">Crushing the goals! 🚀</p>

                  <div className="w-full space-y-5">
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex justify-between items-center transform -rotate-2 shadow-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">🔥</span>
                        <span className="font-bold text-gray-300 text-lg">Streak</span>
                      </div>
                      <span className="text-3xl font-black text-orange-400">{streak}</span>
                    </div>

                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex justify-between items-center transform rotate-1 shadow-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">⭐</span>
                        <span className="font-bold text-gray-300 text-lg">Total XP</span>
                      </div>
                      <span className="text-3xl font-black text-indigo-400">{xp}</span>
                    </div>
                  </div>
                </div>

                <div className="font-medium text-[10px] text-indigo-300/60 tracking-widest uppercase">
                  gamify your student life
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button 
                onClick={handleDownload}
                disabled={downloading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {downloading ? 'Processing...' : (
                  <>
                    <Download className="w-5 h-5" />
                    Download IG Story
                  </>
                )}
              </button>

              <button 
                onClick={handleShareLink}
                className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border border-slate-200 dark:border-slate-700"
              >
                <Share2 className="w-5 h-5" />
                Share Link Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
