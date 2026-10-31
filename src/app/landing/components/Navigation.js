"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogoIcon } from "@/shared/components";

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="fixed top-0 z-50 w-full bg-[#041410]/80 backdrop-blur-md border-b border-white/[0.07]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <button
            type="button"
            className="flex items-center gap-3 cursor-pointer bg-transparent border-none p-0 group"
            onClick={() => router.push("/")}
          >
            <div className="h-9 w-9 rounded-full bg-[#5eead4]/10 border border-[#5eead4]/30 flex items-center justify-center shadow-[0_0_15px_rgba(94,234,212,0.25)] group-hover:scale-105 transition-transform">
              <LogoIcon className="h-5 w-5 text-[#5eead4]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-bold tracking-tight">PALU</span>
              <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-[#5eead4]/10 text-[#5eead4] border border-[#5eead4]/20 font-semibold">
                ROUTER
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-[#9eb3ad]">
            <a className="hover:text-white transition-colors" href="#models">Models & Pricing</a>
            <a className="hover:text-white transition-colors" href="#how-it-works">How It Works</a>
            <a className="hover:text-white transition-colors" href="#capabilities">Capabilities</a>
            <a className="hover:text-white transition-colors" href="#developer">Developers</a>
            <a className="hover:text-white transition-colors" href="/AGENT.md" target="_blank">AGENT.md</a>
          </nav>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Search / Explore Trigger */}
          <button 
            type="button"
            onClick={() => router.push("/#models")}
            aria-label="Search models"
            className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#9eb3ad] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>

          {/* Sign In Pill */}
          <button 
            onClick={() => router.push("/login")}
            className="inline-flex items-center justify-center h-9 px-4 rounded-full border border-white/10 bg-white/5 text-[13px] font-medium text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            Sign in
          </button>

          {/* Primary Mint Green Early Access Pill */}
          <button 
            onClick={() => router.push("/login?tab=register")}
            className="inline-flex items-center justify-center h-9 px-4 gap-2 rounded-full bg-[#5eead4] hover:bg-[#78f7e2] text-[#041814] text-[13px] font-semibold transition-all shadow-[0_0_20px_rgba(94,234,212,0.35)] cursor-pointer"
          >
            <span>Early Access</span>
            <span className="text-xs">→</span>
          </button>

          {/* Mobile hamburger */}
          <button 
            className="md:hidden text-[#9eb3ad] hover:text-white cursor-pointer ml-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/[0.08] bg-[#041410] px-6 py-4 space-y-3 text-[13px]">
          <a className="block text-[#9eb3ad] hover:text-white py-1" href="#models" onClick={() => setMobileMenuOpen(false)}>Models & Pricing</a>
          <a className="block text-[#9eb3ad] hover:text-white py-1" href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
          <a className="block text-[#9eb3ad] hover:text-white py-1" href="#capabilities" onClick={() => setMobileMenuOpen(false)}>Capabilities</a>
          <a className="block text-[#9eb3ad] hover:text-white py-1" href="#developer" onClick={() => setMobileMenuOpen(false)}>Developers</a>
          <a className="block text-[#9eb3ad] hover:text-white py-1" href="/AGENT.md" target="_blank">AGENT.md</a>
        </div>
      )}
    </header>
  );
}

