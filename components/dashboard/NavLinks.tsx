"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export function NavLinks() {
  const [activeSection, setActiveSection] = useState<string>("home");

  useEffect(() => {
    const handleScrollEvent = () => {
      const sections = ["home", "problem", "fitur", "cara-kerja", "testimoni"];
      const scrollPosition = window.scrollY + 120; // Offset for navbar

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScrollEvent);
    handleScrollEvent(); // Trigger once on mount

    return () => window.removeEventListener("scroll", handleScrollEvent);
  }, []);
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (!element) return;

    const yOffset = -96; // Offset for sticky navbar
    const targetY = element.getBoundingClientRect().top + window.scrollY + yOffset;
    
    window.scrollTo({ top: id === "home" ? 0 : targetY, behavior: "smooth" });
  };

  return (
    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500 dark:text-slate-400">
      {["home","problem", "fitur", "cara-kerja", "testimoni"].map((id) => (
        <a
          key={id}
          href={`#${id}`}
          onClick={(e) => handleScroll(e, id)}
          className={`transition-colors cursor-pointer capitalize ${
            activeSection === id
              ? "text-indigo-600 dark:text-indigo-400 font-bold"
              : "hover:text-indigo-600 dark:hover:text-indigo-400"
          }`}
        >
          {id === "cara-kerja" ? "Cara Kerja" : id}
        </a>
      ))}
      <Link
        href="/blog"
        className="transition-colors cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
      >
        Blog
      </Link>
    </div>
  );
}
