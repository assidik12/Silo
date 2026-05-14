"use client";

import React from "react";

export function NavLinks() {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500 dark:text-slate-400">
      <a href="#home" onClick={(e) => handleScroll(e, "home")} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
        Home
      </a>
      <a href="#fitur" onClick={(e) => handleScroll(e, "fitur")} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
        Fitur
      </a>
      <a href="#cara-kerja" onClick={(e) => handleScroll(e, "cara-kerja")} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
        Cara Kerja
      </a>
      <a href="#testimoni" onClick={(e) => handleScroll(e, "testimoni")} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
        Testimoni
      </a>
    </div>
  );
}
