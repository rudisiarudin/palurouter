"use client";
import { useRouter } from "next/navigation";
import Navigation from "./components/Navigation";
import HeroSection from "./components/HeroSection";
import ModelCatalog from "./components/ModelCatalog";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";
import Footer from "./components/Footer";

export default function LandingPage() {
  const router = useRouter();
  return (
    <div className="relative text-white font-sans overflow-x-hidden antialiased selection:bg-teal-500 selection:text-gray-950 bg-[#08100f]">
      {/* Background with Teal Theme */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#08100f]">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: `linear-gradient(to right, #14b8a6 1px, transparent 1px), linear-gradient(to bottom, #14b8a6 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}></div>
        
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[650px] h-[650px] bg-teal-500/10 rounded-full blur-[140px]"></div>
        <div className="absolute top-1/2 right-1/4 w-[550px] h-[550px] bg-emerald-500/10 rounded-full blur-[140px]"></div>
        
        {/* Vignette effect */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(8, 16, 15, 0.6) 100%)'
        }}></div>
      </div>

      <div className="relative z-10">
        <Navigation />
        
        <main>
          <HeroSection />
          <ModelCatalog />
          <HowItWorks />
          <Features />
          
          {/* CTA Section */}
          <section className="py-28 px-6 relative overflow-hidden border-t border-teal-900/30">
            <div className="absolute inset-0 bg-gradient-to-t from-teal-500/5 to-transparent pointer-events-none"></div>
            <div className="max-w-4xl mx-auto text-center relative z-10">
              <h2 className="text-3xl sm:text-5xl font-black mb-6 text-white tracking-tight">
                Mulai Integrasi AI ke Aplikasi & Tools Anda Sekarang
              </h2>
              <p className="text-base sm:text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                Dapatkan API Key PALU Router dalam hitungan detik. Coba tanpa risiko, bayar sesuai pemakaian via QRIS Rupiah.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={() => router.push("/login?tab=register")}
                  className="w-full sm:w-auto h-12 px-8 rounded-lg bg-teal-500 hover:bg-teal-400 text-gray-950 text-base font-bold transition-all shadow-[0_0_25px_rgba(20,184,166,0.5)] cursor-pointer"
                >
                  Daftar Akun Baru
                </button>
                <button 
                  onClick={() => window.open("/AGENT.md", "_blank")}
                  className="w-full sm:w-auto h-12 px-8 rounded-lg border border-teal-500/30 hover:bg-teal-950/40 text-teal-300 text-base font-medium transition-all cursor-pointer"
                >
                  Lihat Dokumentasi AGENT.md
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

