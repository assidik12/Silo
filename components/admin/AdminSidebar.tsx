'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, MessageSquare, ArrowLeft, Menu, X, CheckCircle2, Ticket } from 'lucide-react';
import { ThemeToggle } from '../preferences/ThemeToggle';

export default function AdminSidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'Blog Manager', href: '/admin/blog', icon: FileText },
    { name: 'Feedback Monitor', href: '/admin/feedback', icon: MessageSquare },
    { name: 'Voucher & Premium', href: '/admin/vouchers', icon: Ticket }
  ];

  return (
    <>
      {/* Mobile Header/Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1 rounded-md">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-slate-900 dark:text-white">Silo Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 rounded-xl border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-850"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Dark Overlay for Mobile */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 left-0 h-screen bg-white dark:bg-slate-950 border-r border-gray-200 dark:border-slate-800 z-50 flex flex-col transition-all duration-300 ease-in-out w-64 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top brand */}
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center h-20 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="bg-indigo-600 dark:bg-indigo-500 p-1 rounded-md shrink-0">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-2xl text-indigo-600 dark:text-indigo-400">Silo Admin</span>
          </Link>
          <div className="hidden lg:block">
            <ThemeToggle />
          </div>
        </div>

        {/* Links */}
        <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-200 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-4 mb-2">
            Navigation
          </div>

          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">Silo Admin Panel v1.0</p>
        </div>
      </div>
    </>
  );
}
