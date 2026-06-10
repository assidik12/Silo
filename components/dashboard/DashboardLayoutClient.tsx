"use client";

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  // Read from localStorage if user previously closed it
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('dojo_sidebar_open');
    if (saved !== null) {
      setIsSidebarOpen(saved === 'true');
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    localStorage.setItem('dojo_sidebar_open', String(newState));
  };

  return (
    <div className="flex bg-gray-50 dark:bg-slate-950 min-h-screen">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className={`flex-1 transition-all duration-300 ease-in-out p-4 sm:p-6 lg:p-8 w-full max-w-[100vw] ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Margin atas (pt-14) hanya di layar kecil agar tidak tertutup tombol menu */}
        <div className="pt-14 lg:pt-0">
          {children}
        </div>
      </div>
    </div>
  );
}
