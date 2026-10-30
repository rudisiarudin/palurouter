"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { id: "all", label: "Semua Model" },
  { id: "flagship", label: "🔥 Flagship / Reasoning" },
  { id: "coding", label: "💻 Coding Specialist" },
  { id: "fast", label: "⚡ Super Cepat & Hemat" },
  { id: "media", label: "🎨 Image, Audio, Vision" },
];

const MODELS = [
  {
    id: "claude-3-7-sonnet",
    name: "Claude 3.7 Sonnet",
    provider: "Anthropic",
    category: "flagship",
    badge: "HYBRID REASONING",
    desc: "Model coding & analytical terbaik saat ini dengan kemampuan extended thinking dinamis.",
    priceInput: "Rp 48 / 1k token",
    priceOutput: "Rp 240 / 1k token",
    speed: "Sangat Cepat",
    context: "200k tokens",
    popular: true,
  },
  {
    id: "gpt-4o",
    name: "GPT-4o (Omni)",
    provider: "OpenAI",
    category: "flagship",
    badge: "MOST POPULAR",
    desc: "Flagship serbaguna dengan vision multimodal presisi tinggi dan latensi rendah.",
    priceInput: "Rp 40 / 1k token",
    priceOutput: "Rp 160 / 1k token",
    speed: "Cepat",
    context: "128k tokens",
    popular: true,
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    provider: "DeepSeek",
    category: "fast",
    badge: "BEST VALUE",
    desc: "Performa sekelas frontier model dengan harga 1/10 dari model lainnya.",
    priceInput: "Rp 4 / 1k token",
    priceOutput: "Rp 16 / 1k token",
    speed: "Instan",
    context: "64k tokens",
    popular: true,
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    category: "flagship",
    badge: "REASONING LEADER",
    desc: "Open reasoning model yang bersaing langsung dengan OpenAI o1 untuk problem solving rumit.",
    priceInput: "Rp 8 / 1k token",
    priceOutput: "Rp 32 / 1k token",
    speed: "Reasoning",
    context: "64k tokens",
    popular: false,
  },
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    category: "coding",
    badge: "DEV FAVORITE",
    desc: "Standar emas untuk tool-use, refactoring kode, dan tugas developer.",
    priceInput: "Rp 48 / 1k token",
    priceOutput: "Rp 240 / 1k token",
    speed: "Cepat",
    context: "200k tokens",
    popular: false,
  },
  {
    id: "gemini-2-0-flash",
    name: "Gemini 2.0 Flash",
    provider: "Google",
    category: "fast",
    badge: "SUB-SECOND",
    desc: "Model generasi terbaru Google dengan multimodal vision & audio ultra cepat.",
    priceInput: "Rp 1.6 / 1k token",
    priceOutput: "Rp 6.4 / 1k token",
    speed: "Ultra Cepat",
    context: "1M tokens",
    popular: false,
  },
  {
    id: "flux-1-schnell",
    name: "FLUX.1 Schnell",
    provider: "Black Forest Labs",
    category: "media",
    badge: "IMAGE GEN",
    desc: "Generasi gambar hiper-realistis berkecepatan tinggi dengan prompt detail.",
    priceInput: "Rp 80 / gambar",
    priceOutput: "N/A",
    speed: "2-4 detik",
    context: "Image",
    popular: false,
  },
  {
    id: "whisper-large-v3",
    name: "OpenAI Whisper Large v3",
    provider: "OpenAI",
    category: "media",
    badge: "SPEECH-TO-TEXT",
    desc: "Transkripsi audio multi-bahasa termasuk Bahasa Indonesia sangat akurat.",
    priceInput: "Rp 96 / menit",
    priceOutput: "N/A",
    speed: "Cepat",
    context: "Audio",
    popular: false,
  },
];

export default function ModelCatalog() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const router = useRouter();

  const filtered = selectedCategory === "all"
    ? MODELS
    : MODELS.filter((m) => m.category === selectedCategory);

  return (
    <section id="models" className="py-20 px-6 max-w-7xl mx-auto relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-950/40 px-3 py-1 text-xs font-medium text-teal-300 mb-3">
          Katalog Model & Transparansi Harga
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Pilih Model Terbaik Sesuai Kebutuhan
        </h2>
        <p className="text-gray-400 mt-4 text-sm sm:text-base">
          Gunakan model AI kelas dunia langsung lewat satu API Key. Saldo otomatis dipotong per pemakaian dalam Rupiah (Rp).
        </p>
      </div>

      {/* Filter Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? "bg-teal-500 text-gray-950 font-bold shadow-[0_0_15px_rgba(20,184,166,0.4)]"
                : "bg-[#131f1e] text-gray-300 hover:text-white border border-teal-900/40 hover:border-teal-700/60"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Models */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((model) => (
          <div
            key={model.id}
            className={`relative flex flex-col justify-between p-5 rounded-xl border backdrop-blur-sm transition-all hover:scale-[1.02] ${
              model.popular
                ? "bg-gradient-to-b from-[#132826] to-[#0e1d1c] border-teal-500/40 shadow-[0_0_20px_rgba(20,184,166,0.15)]"
                : "bg-[#0e1a19]/80 border-teal-900/30 hover:border-teal-700/50"
            }`}
          >
            <div>
              {/* Badge & Provider */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  {model.badge}
                </span>
                <span className="text-[11px] text-gray-400 font-medium">
                  {model.provider}
                </span>
              </div>

              {/* Title & Desc */}
              <h3 className="text-lg font-bold text-white mb-1.5 flex items-center gap-1.5">
                {model.name}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                {model.desc}
              </p>
            </div>

            <div className="pt-4 border-t border-teal-900/30">
              {/* Price row */}
              <div className="space-y-1 mb-4 text-xs font-mono">
                <div className="flex justify-between items-center text-gray-300">
                  <span className="text-gray-400">Input:</span>
                  <span className="text-teal-300 font-semibold">{model.priceInput}</span>
                </div>
                {model.priceOutput !== "N/A" && (
                  <div className="flex justify-between items-center text-gray-300">
                    <span className="text-gray-400">Output:</span>
                    <span className="text-emerald-400 font-semibold">{model.priceOutput}</span>
                  </div>
                )}
              </div>

              {/* Speed & Context */}
              <div className="flex items-center justify-between text-[11px] text-gray-400 mb-4 bg-teal-950/40 px-2.5 py-1.5 rounded border border-teal-900/20">
                <span>⚡ {model.speed}</span>
                <span>📦 {model.context}</span>
              </div>

              {/* Action */}
              <button
                onClick={() => router.push("/login?tab=register")}
                className="w-full py-2 rounded-lg text-xs font-bold bg-teal-500/20 hover:bg-teal-500 text-teal-300 hover:text-gray-950 border border-teal-500/40 transition-all cursor-pointer text-center"
              >
                Gunakan Model
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Notice */}
      <div id="pricing" className="mt-16 p-6 rounded-2xl bg-gradient-to-r from-teal-950/40 via-[#0e2120]/60 to-emerald-950/40 border border-teal-500/30 text-center max-w-4xl mx-auto">
        <h4 className="text-lg font-bold text-white mb-2">
          💳 Sistem Deposit Bebas & Fleksibel (Pay-As-You-Go)
        </h4>
        <p className="text-sm text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Tidak ada biaya langganan bulanan yang hangus sia-sia. Cukup top-up saldo mulai dari <strong className="text-teal-300">Rp 10.000 via QRIS</strong>, saldo tidak pernah kedaluwarsa dan hanya terpotong saat API Key Anda melakukan request.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => router.push("/login?tab=register")}
            className="px-6 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-gray-950 font-bold text-sm shadow-[0_0_20px_rgba(20,184,166,0.4)] cursor-pointer"
          >
            Buka Akun & Top Up Sekarang
          </button>
        </div>
      </div>
    </section>
  );
}
