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
    <section id="models" className="py-24 px-6 border-b border-white/[0.08] bg-[#041410] relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#5eead4] mb-3">
              MODEL DIRECTORY & TRANSPARENT PRICING
            </p>
            <h2 className="text-3xl sm:text-5xl font-semibold leading-[1.05] text-white">
              Pilih model terbaik. <br />
              <span className="text-[#9eb3ad] font-normal">Bayar akurat dalam Rupiah (Rp).</span>
            </h2>
          </div>
          <p className="text-[#9eb3ad] text-sm sm:text-base max-w-md leading-relaxed">
            Satu unified endpoint untuk Claude 3.7 Sonnet, DeepSeek R1, GPT-4o, dan Gemini 2.0. Tanpa kartu kredit luar negeri dan tanpa biaya bulanan tersembunyi.
          </p>
        </div>

        {/* Filter Category Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-medium transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-[#5eead4] text-[#041814] font-bold shadow-[0_0_20px_rgba(94,234,212,0.35)]"
                  : "bg-white/5 text-[#9eb3ad] hover:text-white border border-white/[0.08] hover:bg-white/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid of Models */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((model) => (
            <div
              key={model.id}
              className={`relative flex flex-col justify-between p-6 rounded-2xl border backdrop-blur-md transition-all duration-300 hover:scale-[1.02] ${
                model.popular
                  ? "bg-[#06221c]/80 border-[#5eead4]/40 shadow-[0_10px_35px_rgba(94,234,212,0.12)]"
                  : "bg-[#051c17]/60 border-white/[0.08] hover:border-white/20"
              }`}
            >
              <div>
                {/* Badge & Provider */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-[#5eead4]/10 text-[#5eead4] border border-[#5eead4]/20">
                    {model.badge}
                  </span>
                  <span className="text-xs text-[#9eb3ad] font-mono">
                    {model.provider}
                  </span>
                </div>

                {/* Title & Desc */}
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-1.5">
                  {model.name}
                </h3>
                <p className="text-xs text-[#9eb3ad] leading-relaxed mb-6">
                  {model.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.06]">
                {/* Price row */}
                <div className="space-y-1.5 mb-4 text-xs font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-[#9eb3ad]">Input:</span>
                    <span className="text-[#5eead4] font-medium">{model.priceInput}</span>
                  </div>
                  {model.priceOutput !== "N/A" && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#9eb3ad]">Output:</span>
                      <span className="text-emerald-400 font-medium">{model.priceOutput}</span>
                    </div>
                  )}
                </div>

                {/* Speed & Context */}
                <div className="flex items-center justify-between text-[11px] font-mono text-[#9eb3ad] mb-4 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
                  <span>⚡ {model.speed}</span>
                  <span>📦 {model.context}</span>
                </div>

                {/* Action */}
                <button
                  onClick={() => router.push("/login?tab=register")}
                  className="w-full py-2.5 rounded-full text-xs font-semibold bg-white/5 hover:bg-[#5eead4] text-[#d1e5e0] hover:text-[#041814] border border-white/10 hover:border-transparent transition-all cursor-pointer text-center"
                >
                  Gunakan Model
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Notice */}
        <div id="pricing" className="mt-16 p-8 rounded-3xl bg-[#051c17]/80 border border-white/[0.08] text-center max-w-4xl mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#5eead4]/20 bg-[#5eead4]/10 px-3 py-0.5 text-xs text-[#5eead4] mb-3 font-semibold font-mono">
            PAY-AS-YOU-GO IN RUPIAH
          </div>
          <h4 className="text-xl sm:text-2xl font-semibold text-white mb-3">
            Sistem Deposit Prabayar Fleksibel Tanpa Komitmen
          </h4>
          <p className="text-sm text-[#9eb3ad] max-w-2xl mx-auto leading-relaxed">
            Tidak ada biaya langganan bulanan yang hangus sia-sia. Cukup top-up saldo mulai dari <strong className="text-[#5eead4]">Rp 10.000 via QRIS</strong>, saldo tidak pernah kedaluwarsa dan hanya terpotong saat API Key Anda melakukan request secara riil.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => router.push("/login?tab=register")}
              className="px-7 py-2.5 rounded-full bg-[#5eead4] hover:bg-[#78f7e2] text-[#041814] font-semibold text-sm shadow-[0_4px_25px_rgba(94,234,212,0.35)] transition-all cursor-pointer"
            >
              Buka Akun & Top Up Sekarang
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
