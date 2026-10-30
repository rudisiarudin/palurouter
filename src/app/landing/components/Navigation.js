"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogoIcon } from "@/shared/components";

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <nav className="fixed top-0 z-50 w-full bg-[#08090a]/80 backdrop-blur-md border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <button
          type="button"
          className="flex items-center gap-2.5 cursor-pointer bg-transparent border-none p-0 group"
          onClick={() => router.push("/")}
        >
          <LogoIcon className="h-6 w-6 text-white group-hover:opacity-80 transition-opacity" />
          <div className="flex items-center gap-2">
            <span className="text-[#f7f8f8] text-sm font-semibold tracking-tight">PALU</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.06] text-[#8a8f98] border border-white/[0.08]">
              ROUTER
            </span>
          </div>
        </button>

        {/* Links */}
        <div className="hidden md:flex items-center gap-6 text-[13px] font-medium text-[#8a8f98]">
          <a className="hover:text-[#f7f8f8] transition-colors" href="#models">Models & Pricing</a>
          <a className="hover:text-[#f7f8f8] transition-colors" href="#code">Integration</a>
          <a className="hover:text-[#f7f8f8] transition-colors" href="#architecture">Architecture</a>
          <a className="hover:text-[#f7f8f8] transition-colors" href="/AGENT.md" target="_blank">AGENT.md</a>
        </div>

        {/* Action */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/login")}
            className="text-[13px] font-medium text-[#8a8f98] hover:text-[#f7f8f8] px-2.5 py-1 transition-colors cursor-pointer"
          >
            Sign in
          </button>
          <button 
            onClick={() => router.push("/login?tab=register")}
            className="h-8 px-3 rounded-md bg-[#5e6ad2] hover:bg-[#7170ff] transition-all text-white text-[13px] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.4)] flex items-center gap-1.5 cursor-pointer"
          >
            <span>Get API Key</span>
            <span className="text-white/70">→</span>
          </button>
          <button 
            className="md:hidden text-[#8a8f98] hover:text-white cursor-pointer ml-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="material-symbols-outlined text-[20px]">{mobileMenuOpen ? "close" : "menu"}</span>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/[0.06] bg-[#08090a] px-6 py-4 space-y-3 text-[13px]">
          <a className="block text-[#8a8f98] hover:text-white py-1" href="#models" onClick={() => setMobileMenuOpen(false)}>Models & Pricing</a>
          <a className="block text-[#8a8f98] hover:text-white py-1" href="#code" onClick={() => setMobileMenuOpen(false)}>Integration</a>
          <a className="block text-[#8a8f98] hover:text-white py-1" href="#architecture" onClick={() => setMobileMenuOpen(false)}>Architecture</a>
          <a className="block text-[#8a8f98] hover:text-white py-1" href="/AGENT.md" target="_blank">AGENT.md</a>
        </div>
      )}
    </nav>
  );
}

