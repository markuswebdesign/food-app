"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#1D2D18] border-b border-[#F5EFE0]/10" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-tight text-[#F5EFE0]"
        >
          food<span className="text-[#D4A853]">.</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-sm text-[#F5EFE0]/70 hover:text-[#F5EFE0] transition-colors"
          >
            Anmelden
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium bg-[#D4A853] text-[#1D2D18] px-4 py-2 hover:bg-[#C8903A] transition-colors"
          >
            Kostenlos starten
          </Link>
        </nav>
      </div>
    </header>
  );
}
