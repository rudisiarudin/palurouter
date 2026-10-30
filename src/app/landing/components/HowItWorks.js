"use client";

export default function HowItWorks() {
  return (
    <section className="py-24 border-y border-teal-900/30 bg-[#0d1615]/60" id="how-it-works">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Cara Kerja PALU Router</h2>
          <p className="text-gray-400 text-base">
            Integrasi instan dalam 3 langkah mudah. Tanpa ubah struktur kode aplikasi Anda.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-gray-700 via-teal-400 to-gray-700 -z-10"></div>
          
          {/* Step 1: Dapatkan API Key */}
          <div className="flex flex-col gap-6 relative group">
            <div className="w-24 h-24 rounded-2xl bg-[#111f1e] border border-teal-900/50 flex items-center justify-center shadow-xl group-hover:border-teal-500 transition-colors z-10 mx-auto md:mx-0">
              <span className="material-symbols-outlined text-4xl text-teal-400">key</span>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-white">1. Daftar & Top Up Saldo</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Buat akun dalam 10 detik, top-up saldo via QRIS, dan generate API key unik Anda (`sk-palu-xxxx`).
              </p>
            </div>
          </div>

          {/* Step 2: Ganti Base URL */}
          <div className="flex flex-col gap-6 relative group md:items-center md:text-center">
            <div className="w-24 h-24 rounded-2xl bg-[#111f1e] border-2 border-teal-400 flex items-center justify-center shadow-[0_0_30px_rgba(20,184,166,0.3)] z-10 mx-auto">
              <span className="material-symbols-outlined text-4xl text-teal-300 animate-pulse">swap_horiz</span>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-teal-400">2. Ganti Base URL</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Arahkan `baseURL` pada SDK OpenAI / Anthropic atau coding tool (Cursor / Cline) ke endpoint PALU Router.
              </p>
            </div>
          </div>

          {/* Step 3: Jalankan Tanpa Hambatan */}
          <div className="flex flex-col gap-6 relative group md:items-end md:text-right">
            <div className="w-24 h-24 rounded-2xl bg-[#111f1e] border border-teal-900/50 flex items-center justify-center shadow-xl group-hover:border-teal-500 transition-colors z-10 mx-auto md:mx-0">
              <span className="material-symbols-outlined text-4xl text-emerald-400">rocket_launch</span>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-white">3. Nikmati AI Bebas Limit</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Request Anda otomatis diroute dengan latensi terendah, smart caching, dan proteksi failover otomatis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

