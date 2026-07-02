'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, History, LogOut, CheckCircle2, Menu, X, User, MessageCircle, BookOpen, MessageSquareReply } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '../preferences/ThemeToggle';

interface SidebarProps {
  isOpen?: boolean;
  toggleSidebar?: () => void;
}

export default function Sidebar({ isOpen = true, toggleSidebar }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        setIsAdmin(true);
      }
    };
    checkAdmin();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Task Management', href: '/dashboard/task', icon: PlusCircle },
    { name: 'Learning Hub', href: '/dashboard/learning', icon: BookOpen },
    { name: 'Journaling', href: '/dashboard/journal', icon: MessageCircle },
    { name: 'Feedback', href: '/dashboard/feedback', icon: MessageSquareReply },
    { name: 'Profile', href: '/dashboard/profile', icon: User }
  ];

  if (isAdmin) {
    navLinks.push({ name: 'Admin Panel', href: '/admin/blog', icon: History });
  }

  const closeSidebar = () => setIsMobileOpen(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-60 bg-white dark:bg-slate-900 p-2 rounded-xl shadow-sm dark:shadow-none border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Dark Overlay for Mobile */}
      {isMobileOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 left-0 h-screen bg-white dark:bg-slate-950 border-r border-gray-200 dark:border-slate-800 z-50 flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'
        } ${isOpen ? 'lg:translate-x-0 lg:w-64' : 'lg:translate-x-0 lg:w-20'}`}
      >
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center h-20 shrink-0">
          <h2 className={`font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 transition-all ${isOpen ? 'text-2xl' : 'text-xl'}`}>
            <div className="bg-indigo-600 dark:bg-indigo-500 p-1 rounded-md shrink-0">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            {isOpen && <span>Silo</span>}
          </h2>
          {isOpen && <ThemeToggle />}
        </div>

        <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={closeSidebar} // Tutup sidebar otomatis saat menu diklik di HP
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors whitespace-nowrap ${isActive
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-slate-200'
                  }`}
                title={!isOpen ? link.name : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                  {link.name}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-slate-800 shrink-0 space-y-2">
          {toggleSidebar && (
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <Menu className="w-5 h-5 shrink-0" />
              <span className={`${isOpen ? 'block' : 'hidden'}`}>Tutup Menu</span>
            </button>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium text-gray-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title={!isOpen ? "Logout" : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
              Logout
            </span>
          </button>
          <Link
            href="/privacy-policy"
            className={`flex items-center justify-center mt-2 w-full rounded-xl text-xs font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest hover:text-indigo-400 dark:hover:text-indigo-500 transition-all duration-300 ${isOpen ? 'opacity-100 py-2' : 'opacity-0 h-0 overflow-hidden'}`}
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </>
  );
}
