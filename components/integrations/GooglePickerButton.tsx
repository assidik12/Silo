'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { HardDrive, Loader2 } from 'lucide-react';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

interface GooglePickerButtonProps {
  onFolderSelect: (folderId: string, folderName: string) => void;
}

// Ganti dengan API Key & Client ID yang valid dari Google Cloud Console
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "541438326409-baj4ucpfd06udtg1pmja95ir0h5nik0c.apps.googleusercontent.com";
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ""; 
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

export default function GooglePickerButton({ onFolderSelect }: GooglePickerButtonProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // 1. Load Scripts
  useEffect(() => {
    const loadScripts = () => {
      const script1 = document.createElement('script');
      script1.src = 'https://apis.google.com/js/api.js';
      script1.async = true;
      script1.defer = true;
      script1.onload = () => setIsLoaded(true);
      document.body.appendChild(script1);

      const script2 = document.createElement('script');
      script2.src = 'https://accounts.google.com/gsi/client';
      script2.async = true;
      script2.defer = true;
      document.body.appendChild(script2);
    };

    loadScripts();
  }, []);

  // 2. Initialize Picker
  const createPicker = useCallback((token: string) => {
    const view = new window.google.picker.DocsView(window.google.picker.ViewId.FOLDERS)
      .setSelectFolderEnabled(true)
      .setIncludeFolders(true)
      .setMimeTypes('application/vnd.google-apps.folder');

    const picker = new window.google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(token)
      .setDeveloperKey(API_KEY)
      .setCallback((data: any) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const folder = data.docs[0];
          onFolderSelect(folder.id, folder.name);
        }
        if (data.action === window.google.picker.Action.CANCEL || data.action === window.google.picker.Action.PICKED) {
           setIsOpening(false);
        }
      })
      .build();
    
    picker.setVisible(true);
  }, [onFolderSelect]);

  // 3. Handle Auth & Open
  const handleOpenPicker = () => {
    if (!isLoaded) return;
    setIsOpening(true);

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response: any) => {
        if (response.error !== undefined) {
          setIsOpening(false);
          throw response;
        }
        setAccessToken(response.access_token);
        window.gapi.load('picker', () => createPicker(response.access_token));
      },
    });

    if (accessToken) {
      window.gapi.load('picker', () => createPicker(accessToken));
    } else {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    }
  };

  return (
    <Button 
      type="button"
      variant="outline"
      disabled={!isLoaded || isOpening}
      onClick={handleOpenPicker}
      className="flex items-center gap-2 h-12 px-6 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-bold transition-all active:scale-95"
    >
      {isOpening ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <HardDrive className="w-5 h-5 text-blue-500" />
      )}
      {isOpening ? "Opening Drive..." : "Pilih Folder Drive"}
    </Button>
  );
}
