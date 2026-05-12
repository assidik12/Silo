'use client';

import React, { useRef, useState } from 'react';
import { Share2, Download, Copy, Check, Loader2 } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import ShareCard from './ShareCard';
import { Button } from '@/components/ui/button';

interface ShareButtonProps {
  userId: string;
  userData: {
    name: string;
    major: string;
    xp: number;
    streak: number;
    bio: string;
    learning_type?: string;
    avatar_url?: string;
  };
}

export default function ShareButton({ userId, userData }: ShareButtonProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async (platform?: 'ig' | 'wa') => {
    if (!cardRef.current) return;
    
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const blob = await htmlToImage.toBlob(cardRef.current, {
        quality: 1.0,
        pixelRatio: 3, 
      });

      if (!blob) throw new Error('Failed to generate image');

      const fileName = `dojo-${platform || 'achievement'}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My DoJo Achievement',
        });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = fileName;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        handleCopyLink();
      }
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const InstagramIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
  );

  const WhatsAppIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7 8.38 8.38 0 0 1 3.8.9L21 3z"></path></svg>
  );

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/share/${userId}`;
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <>
      <div className="flex flex-col gap-3 w-full mt-6">
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => handleShare('ig')} 
            disabled={isGenerating}
            className="bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:opacity-90 text-white font-bold py-7 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 border-none"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <InstagramIcon />}
            Story
          </Button>
          
          <Button 
            onClick={() => handleShare('wa')} 
            disabled={isGenerating}
            className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-7 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 border-none"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <WhatsAppIcon />}
            WhatsApp
          </Button>
        </div>

        <Button 
          variant="outline"
          onClick={handleCopyLink}
          className="w-full py-6 rounded-2xl border-slate-200 hover:bg-slate-50 text-slate-500 font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          {isCopied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
          {isCopied ? 'Copied Link!' : 'Copy Achievement Link'}
        </Button>
      </div>

      {/* Hidden Share Card for Capture */}
      <div className="fixed top-0 left-[-9999px] pointer-events-none" aria-hidden="true">
        <ShareCard userData={userData} ref={cardRef} />
      </div>
    </>
  );
}
