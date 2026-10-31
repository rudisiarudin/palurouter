"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogoIcon } from "@/shared/components";

export default function HeroSection() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const copySnippet = () => {
    navigator.clipboard.writeText('export OPENAI_BASE_URL="http://localhost:20128/v1"\nexport OPENAI_API_KEY="sk-palu-..."');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden border-b border-white/[0.08]" aria-labelledby="hero-heading">
      {/* Ambient background glow & radial gradient */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-[#5eead4]/[0.06] rounded-full blur-[160px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        
        {/* Left Column: Hero Value Proposition */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          
          {/* Eyebrow / Kicker */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#5eead4]/20 bg-[#5eead4]/10 px-3.5 py-1 text-xs text-[#5eead4] mb-6 font-medium tracking-wide shadow-[0_0_15px_rgba(94,234,212,0.15)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5eead4] animate-pulse"></span>
            <span className="uppercase tracking-widest text-[11px] font-semibold">PALU ROUTER GATEWAY FOUNDATION</span>
          </div>

          {/* Primary Headline */}
          <h1 id="hero-heading" className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-[-0.04em] leading-[1.02] text-white">
            A unified routing layer <br />
            <span className="text-[#9eb3ad] font-normal">for foundation models.</span>
          </h1>

          {/* Subtitle Description */}
          <p className="mt-6 text-base sm:text-lg text-[#9eb3ad] max-w-xl font-normal leading-relaxed">
            We route, balance, and optimize LLM requests across Claude 3.7, GPT-4o, DeepSeek R1, and local inference nodes with zero-downtime failover and native Rupiah (Rp) billing.
          </p>

          {/* Call to Action Group */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button 
              onClick={() => router.push("/login?tab=register")}
              className="inline-flex items-center justify-center h-11 px-6 gap-2.5 rounded-full bg-[#5eead4] hover:bg-[#78f7e2] text-[#041814] text-sm font-semibold transition-all shadow-[0_4px_25px_rgba(94,234,212,0.35)] cursor-pointer active:scale-95"
            >
              <span>Early Access</span>
              <span className="text-xs">→</span>
            </button>

            <button 
              type="button"
              onClick={() => router.push("/#models")}
              aria-label="Search models"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#9eb3ad] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>

            <a 
              href="/AGENT.md"
              target="_blank"
              className="inline-flex items-center justify-center h-11 px-5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all gap-2 cursor-pointer"
            >
              <span className="font-mono text-xs text-[#5eead4]">$</span>
              <span>AGENT.md</span>
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-10 flex flex-wrap items-center gap-6 text-xs text-[#9eb3ad]">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#5eead4]"></span>
              <span><strong>99.99%</strong> Gateway Uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span><strong>&lt; 15ms</strong> Routing Overhead</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-teal-300"></span>
              <span><strong>Dual Engine</strong> SQLite & Supabase</span>
            </div>
          </div>
        </div>

        {/* Right Column: High-End Proximus-style 3D Isometric Gateway Terminal */}
        <div className="lg:col-span-5 flex justify-center items-center py-6">
          <div className="relative w-full max-w-[440px] aspect-square flex items-center justify-center">
            
            {/* Ground Reflection & Grid Lines */}
            <div className="absolute inset-0 bg-[radial-gradient(#5eead4_1px,transparent_1px)] [background-size:24px_24px] opacity-15 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)] pointer-events-none"></div>

            {/* Isometric Stage */}
            <div className="relative w-[340px] h-[340px] transition-transform duration-500 hover:scale-[1.02]">
              
              {/* Layer 1: Hardware Terminal Baseplate */}
              <div className="absolute bottom-0 inset-x-0 h-44 rounded-2xl bg-gradient-to-b from-[#08221c] to-[#041512] border border-[#5eead4]/30 shadow-[0_25px_60px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.15)] p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#5eead4] animate-ping"></span>
                    <span className="font-mono text-[11px] font-semibold tracking-wider text-[#5eead4]">ROUTER TERMINAL V1</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#9eb3ad] bg-white/5 px-2 py-0.5 rounded border border-white/5">PORT 20128</span>
                </div>

                {/* Circuit Grid Indicator */}
                <div className="grid grid-cols-3 gap-2 my-1">
                  <div className="bg-[#051c17] p-2 rounded-lg border border-white/5">
                    <div className="text-[9px] font-mono text-[#9eb3ad] uppercase">Failover</div>
                    <div className="text-xs font-mono font-bold text-[#5eead4]">ACTIVE</div>
                  </div>
                  <div className="bg-[#051c17] p-2 rounded-lg border border-white/5">
                    <div className="text-[9px] font-mono text-[#9eb3ad] uppercase">Cache Hit</div>
                    <div className="text-xs font-mono font-bold text-white">84.2%</div>
                  </div>
                  <div className="bg-[#051c17] p-2 rounded-lg border border-white/5">
                    <div className="text-[9px] font-mono text-[#9eb3ad] uppercase">Latency</div>
                    <div className="text-xs font-mono font-bold text-emerald-400">14ms</div>
                  </div>
                </div>

                {/* Status LED vents */}
                <div className="flex items-center justify-between pt-2 text-[10px] font-mono text-[#9eb3ad]">
                  <div className="flex gap-1.5">
                    <span className="h-1.5 w-4 rounded-full bg-[#5eead4]"></span>
                    <span className="h-1.5 w-4 rounded-full bg-[#5eead4]/50"></span>
                    <span className="h-1.5 w-4 rounded-full bg-white/20"></span>
                  </div>
                  <span>STANDBY AUTO-ROUTING</span>
                </div>
              </div>

              {/* Layer 2: Floating Translucent Emerald Glass API Token Card */}
              <div className="absolute top-4 inset-x-2 h-48 rounded-xl bg-gradient-to-br from-[#5eead4]/20 via-[#0a2f26]/80 to-[#041914]/90 backdrop-blur-xl border border-[#5eead4]/40 shadow-[0_20px_45px_rgba(94,234,212,0.15),inset_0_1px_1px_rgba(255,255,255,0.4)] p-5 flex flex-col justify-between -rotate-2 hover:rotate-0 transition-transform duration-300">
                {/* Card Header with EMV Chip & Contactless */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#5eead4]/20 border border-[#5eead4]/40 flex items-center justify-center">
                      <LogoIcon className="h-4 w-4 text-[#5eead4]" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-white tracking-wider">PALU GATEWAY</div>
                      <div className="text-[9px] font-mono text-[#5eead4]/80">UNIFIED KEY</div>
                    </div>
                  </div>

                  {/* Contactless symbol */}
                  <svg className="w-5 h-5 text-[#5eead4]/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8.5 16.5a5 5 0 0 1 0-7" strokeLinecap="round" />
                    <path d="M12 19a8.5 8.5 0 0 0 0-14" strokeLinecap="round" />
                    <path d="M15.5 21.5a12 12 0 0 0 0-21" strokeLinecap="round" />
                  </svg>
                </div>

                {/* EMV Gold Chip & Masked Key */}
                <div className="my-auto flex items-center justify-between">
                  <div className="w-9 h-7 rounded bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 border border-amber-300/60 shadow-sm flex items-center justify-center">
                    <div className="w-5 h-4 border border-amber-700/30 rounded-xs"></div>
                  </div>
                  <div className="font-mono text-xs text-white/90 tracking-widest bg-black/30 px-2.5 py-1 rounded border border-white/10">
                    sk-palu-••••••••9842
                  </div>
                </div>

                {/* Card Footer: User & Balance in Rupiah */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-[#9eb3ad]">Cardholder</div>
                    <div className="text-white font-medium text-[11px]">Developer Klien</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] uppercase tracking-wider text-[#9eb3ad]">Prepaid Balance</div>
                    <div className="text-[#5eead4] font-bold font-mono text-[11px]">Rp 250.000</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Supported Ecosystem Infinite Marquee Banner */}
      <div className="mt-16 pt-8 border-t border-white/[0.06] overflow-hidden">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9eb3ad] mb-6">
          Supported Models & Agent Toolchains
        </p>
        <div className="flex items-center justify-center flex-wrap gap-8 sm:gap-12 text-sm font-medium text-[#9eb3ad]/80 opacity-80">
          <span className="hover:text-white transition-colors">Claude 3.7 Sonnet</span>
          <span className="hover:text-white transition-colors">GPT-4o</span>
          <span className="hover:text-white transition-colors">DeepSeek R1 & V3</span>
          <span className="hover:text-white transition-colors">Gemini 2.0 Flash</span>
          <span className="hover:text-white transition-colors">Llama 3.3 70B</span>
          <span className="hover:text-white transition-colors">Groq</span>
          <span className="hover:text-white transition-colors">Cursor & Cline</span>
          <span className="hover:text-white transition-colors">Claude Code</span>
          <span className="hover:text-white transition-colors">Hermes Agent</span>
          <span className="hover:text-white transition-colors">Supabase</span>
        </div>
      </div>
    </section>
  );
}

