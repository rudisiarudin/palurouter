"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const copySnippet = () => {
    navigator.clipboard.writeText("export OPENAI_BASE_URL=\"http://localhost:20127/v1\"\nexport OPENAI_API_KEY=\"sk-palu-...\"");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative pt-28 pb-16 px-6 flex flex-col items-center justify-center overflow-hidden border-b border-white/[0.04]">
      {/* Background Ambient Spotlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#5e6ad2]/[0.08] rounded-full blur-[140px] pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl w-full text-center flex flex-col items-center">
        {/* Pill Changelog */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-xs text-[#8a8f98] mb-8 hover:border-white/[0.15] transition-colors cursor-pointer"
             onClick={() => router.push("/login?tab=register")}>
          <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]"></span>
          <span className="text-[#d0d6e0] font-medium">PALU Router 1.0</span>
          <span className="text-white/20">|</span>
          <span>Zero-latency failover engine</span>
          <span className="text-white/40">→</span>
        </div>

        {/* Headline with tight letter-spacing */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-[-0.04em] leading-[1.05] text-[#f7f8f8] max-w-3xl">
          The unified gateway <br />
          <span className="text-[#8a8f98]">for all foundation models.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-[#8a8f98] max-w-xl font-normal leading-relaxed">
          Route queries across Claude 3.7, GPT-4o, DeepSeek, and Whisper with a single API key. 
          Native pay-as-you-go balance in Indonesian Rupiah (Rp).
        </p>

        {/* Primary CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button 
            onClick={() => router.push("/login?tab=register")}
            className="h-10 px-5 rounded-md bg-[#5e6ad2] hover:bg-[#7170ff] text-white text-[13px] font-medium transition-all shadow-[0_1px_3px_rgba(0,0,0,0.4)] flex items-center gap-2 cursor-pointer"
          >
            <span>Create Account</span>
            <span className="text-white/60">→</span>
          </button>

          <a 
            href="/AGENT.md"
            target="_blank"
            className="h-10 px-4 rounded-md border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-[#d0d6e0] text-[13px] font-medium transition-all flex items-center gap-2 cursor-pointer"
          >
            <span className="font-mono text-xs text-[#8a8f98]">$</span>
            <span>View AGENT.md</span>
          </a>
        </div>

        {/* Developer terminal code block */}
        <div className="mt-12 w-full max-w-2xl text-left rounded-lg border border-white/[0.08] bg-[#0c0d0e] shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.01]">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-white/[0.12]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-white/[0.12]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-white/[0.12]"></div>
              <span className="ml-2 text-[11px] font-mono text-[#8a8f98]">.env / bash profile</span>
            </div>
            <button 
              onClick={copySnippet}
              className="text-[11px] font-mono text-[#8a8f98] hover:text-white px-2 py-0.5 rounded hover:bg-white/[0.05] transition-colors cursor-pointer"
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>
          <div className="p-4 font-mono text-xs text-[#d0d6e0] leading-relaxed overflow-x-auto space-y-1">
            <div className="text-[#8a8f98]"># Point any OpenAI-compatible SDK directly to PALU</div>
            <div><span className="text-[#7170ff]">export</span> OPENAI_BASE_URL=<span className="text-[#10b981]">"http://localhost:20127/v1"</span></div>
            <div><span className="text-[#7170ff]">export</span> OPENAI_API_KEY=<span className="text-[#10b981]">"sk-palu-live-user_key"</span></div>
          </div>
        </div>

        {/* Integration logos banner */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-[12px] font-medium text-[#8a8f98]">
          <span className="hover:text-white transition-colors">Cursor</span>
          <span className="text-white/10">•</span>
          <span className="hover:text-white transition-colors">Cline & Roo Code</span>
          <span className="text-white/10">•</span>
          <span className="hover:text-white transition-colors">Claude Code</span>
          <span className="text-white/10">•</span>
          <span className="hover:text-white transition-colors">Hermes Agent</span>
          <span className="text-white/10">•</span>
          <span className="hover:text-white transition-colors">LangChain & LlamaIndex</span>
        </div>
      </div>
    </section>
  );
}

