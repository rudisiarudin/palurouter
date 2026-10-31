"use client";
import { useRouter } from "next/navigation";
import Navigation from "./components/Navigation";
import HeroSection from "./components/HeroSection";
import ModelCatalog from "./components/ModelCatalog";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";
import DeveloperSection from "./components/DeveloperSection";
import Footer from "./components/Footer";

export default function LandingPage() {
  const router = useRouter();
  return (
    <div className="relative text-white font-sans overflow-x-hidden antialiased selection:bg-[#5eead4] selection:text-[#041814] bg-[#041410]">
      {/* Background with Proximus-style Deep Emerald Theme */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#041410]">
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.07]" 
          style={{
            backgroundImage: `linear-gradient(to right, #5eead4 1px, transparent 1px), linear-gradient(to bottom, #5eead4 1px, transparent 1px)`,
            backgroundSize: '48px 48px'
          }}
        ></div>
        
        {/* Ambient gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[750px] h-[750px] bg-[#5eead4]/[0.05] rounded-full blur-[160px]"></div>
        <div className="absolute top-1/2 right-1/4 w-[650px] h-[650px] bg-[#10b981]/[0.04] rounded-full blur-[160px]"></div>
        
        {/* Radial vignette effect */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(4, 20, 16, 0.75) 100%)'
        }}></div>
      </div>

      <div className="relative z-10">
        <Navigation />
        
        <main>
          <HeroSection />
          <ModelCatalog />
          <HowItWorks />
          <Features />
          <DeveloperSection />
          
          {/* Proximus-style CTA Section */}
          <section className="py-28 px-6 relative overflow-hidden border-b border-white/[0.08] bg-[#041410]">
            <div className="max-w-4xl mx-auto text-center relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#5eead4]/20 bg-[#5eead4]/10 px-3.5 py-1 text-xs text-[#5eead4] mb-6 font-semibold tracking-wider uppercase">
                GET STARTED IN SECONDS
              </div>
              <h2 className="text-3xl sm:text-5xl font-semibold mb-6 text-white tracking-tight leading-tight">
                Connect your first application <br />
                <span className="text-[#9eb3ad] font-normal">to the PALU Router Gateway.</span>
              </h2>
              <p className="text-base sm:text-lg text-[#9eb3ad] mb-10 max-w-2xl mx-auto leading-relaxed">
                Buat akun klien baru dalam 10 detik. Dapatkan bonus saldo trial Rp 5.000 dan mulai request ke semua foundation model terbaik dunia.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={() => router.push("/login?tab=register")}
                  className="w-full sm:w-auto h-11 px-8 rounded-full bg-[#5eead4] hover:bg-[#78f7e2] text-[#041814] text-sm font-semibold transition-all shadow-[0_4px_25px_rgba(94,234,212,0.35)] cursor-pointer active:scale-95"
                >
                  Daftar Klien Baru (Bonus Rp 5.000)
                </button>
                <button 
                  onClick={() => window.open("/AGENT.md", "_blank")}
                  className="w-full sm:w-auto h-11 px-7 rounded-full border border-white/10 hover:bg-white/10 text-white text-sm font-medium transition-all cursor-pointer"
                >
                  Buka Dokumentasi AGENT.md
                </button>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}

