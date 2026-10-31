"use client";
import { LogoIcon } from "@/shared/components";

export default function Footer() {
  return (
    <footer className="bg-[#041410] py-16 px-6">
      <div className="max-w-7xl mx-auto rounded-3xl bg-[#051c17]/60 border border-white/[0.08] p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10 mb-12">
          {/* Brand & Mission */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-full bg-[#5eead4]/15 border border-[#5eead4]/30 flex items-center justify-center">
                <LogoIcon className="h-5 w-5 text-[#5eead4]" />
              </div>
              <span className="text-white text-base font-bold tracking-tight">PALU Router</span>
            </div>
            <p className="text-[#9eb3ad] text-sm leading-6 max-w-sm">
              PALU Router Foundation builds reliable security and routing infrastructure for AI inference models and autonomous agent workflows.
            </p>
          </div>

          {/* Product Links */}
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-white">Product</p>
            <a className="text-[#9eb3ad] hover:text-white text-sm transition-colors" href="#models">Models & Combos</a>
            <a className="text-[#9eb3ad] hover:text-white text-sm transition-colors" href="#pricing">Pricing Transparansi</a>
            <a className="text-[#9eb3ad] hover:text-white text-sm transition-colors" href="#capabilities">Failover Engine</a>
            <a className="text-[#9eb3ad] hover:text-white text-sm transition-colors" href="#how-it-works">Architecture</a>
          </div>

          {/* Developer Links */}
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-white">Developers</p>
            <a className="text-[#9eb3ad] hover:text-white text-sm transition-colors" href="#developer">OpenAI SDK Contract</a>
            <a className="text-[#9eb3ad] hover:text-white text-sm transition-colors" href="/AGENT.md" target="_blank">AGENT.md Specification</a>
            <a className="text-[#9eb3ad] hover:text-white text-sm transition-colors" href="https://github.com/rudisiarudin/palurouter" target="_blank" rel="noreferrer">GitHub Repository</a>
            <a className="text-[#9eb3ad] hover:text-white text-sm transition-colors" href="/login">Client Portal</a>
          </div>

          {/* System & Operations */}
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-white">System</p>
            <div className="flex items-center gap-2 text-sm text-[#5eead4]">
              <span className="h-2 w-2 rounded-full bg-[#5eead4] animate-pulse"></span>
              <span>All Gateways Operational</span>
            </div>
            <span className="text-[#9eb3ad] text-xs">Port 20128 • v1.0.0</span>
            <span className="text-[#9eb3ad] text-xs">Dual SQLite & Supabase</span>
          </div>
        </div>

        {/* Bottom Bar Container */}
        <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9eb3ad]">
          <p>© {new Date().getFullYear()} PALU Router Gateway Foundation. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Jakarta, Indonesia</span>
            <span>•</span>
            <span className="text-[#5eead4] font-medium">Tetap Gesit! 🚀</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

