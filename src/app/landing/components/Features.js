"use client";

const CAPABILITIES = [
  {
    tag: "Failover Cascades",
    badge: "Auto-Recovery",
    title: "A shield against upstream outages.",
    desc: "Jika provider utama terkena HTTP 429 rate limit atau service 503, PALU Router otomatis memindahkan request ke provider backup tanpa memutus sesi pengguna.",
    cue: "Zero-Downtime Routing",
  },
  {
    tag: "Monetisasi & Billing",
    badge: "QRIS Rupiah (Rp)",
    title: "Know exactly what you spend.",
    desc: "Top-up saldo prabayar instan dalam Rupiah (Rp). Tanpa kartu kredit luar negeri, tanpa konversi kurs USD yang mencekik, dan potong saldo akurat per token.",
    cue: "Transparent Cost Ledger",
  },
  {
    tag: "Prompt Caching",
    badge: "Cache Retention",
    title: "Speed meets extreme economy.",
    desc: "Mekanisme context caching pintar menyimpan prompt berulang secara lokal di memori, memotong biaya token hingga 80% dan mempercepat respons awal.",
    cue: "Instant Token Stream",
  },
  {
    tag: "Developer Toolchains",
    badge: "100% Drop-In",
    title: "Fits the exact way you build.",
    desc: "Kompatibel penuh dengan Cursor, Windsurf, Cline, Roo Code, Claude Code, Hermes Agent, dan semua library Python/Node.js yang mendukung OpenAI standard.",
    cue: "Single baseURL Switch",
  },
  {
    tag: "Dual-Engine Database",
    badge: "Cloud & Self-Hosted",
    title: "Your data. Your deployment.",
    desc: "Jalankan dengan database cloud Supabase PostgreSQL untuk sinkronisasi multi-device, atau gunakan mode embedded SQLite lokal di VPS / PC Rumah.",
    cue: "Supabase & SQLite Ready",
  },
  {
    tag: "Access & RBAC",
    badge: "Least-Privilege",
    title: "Enforce security on every request.",
    desc: "Kunci akses API Key klien dengan proteksi least-privilege. Endpoint admin terisolasi aman, pencegahan token leak, dan enkripsi data end-to-end.",
    cue: "Isolated Client Keys",
  },
];

export default function Features() {
  return (
    <section className="py-24 px-6 border-b border-white/[0.08] bg-[#041410]" id="capabilities">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#5eead4] mb-3">
              THE CAPABILITIES
            </p>
            <h2 className="text-3xl sm:text-5xl font-semibold leading-[1.05] text-white">
              One routing layer. <br />
              <span className="text-[#9eb3ad] font-normal">Every point of trust.</span>
            </h2>
          </div>
          <p className="text-[#9eb3ad] text-sm sm:text-base max-w-md leading-relaxed">
            From the first API handshake to the final streamed token. Built specifically for high-throughput AI workloads and agentic workflows.
          </p>
        </div>

        {/* 6 Grid Capability Bento */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CAPABILITIES.map((item) => (
            <div 
              key={item.title}
              className="rounded-2xl border border-white/[0.08] bg-[#051c17]/60 hover:bg-[#07241e]/80 transition-all duration-300 p-7 flex flex-col justify-between group hover:border-[#5eead4]/40 hover:shadow-[0_10px_35px_rgba(94,234,212,0.12)] relative overflow-hidden"
            >
              {/* Subtle top edge glow on hover */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#5eead4]/0 to-transparent group-hover:via-[#5eead4]/50 transition-all"></div>

              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-mono font-medium text-[#5eead4] tracking-wide">
                    {item.tag}
                  </span>
                  <span className="text-[10px] font-mono text-[#9eb3ad] bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-[#5eead4] transition-colors leading-snug">
                  {item.title}
                </h3>
                <p className="text-sm text-[#9eb3ad] leading-relaxed mb-6">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-[#9eb3ad]">
                <span>{item.cue}</span>
                <span className="text-[#5eead4] group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

