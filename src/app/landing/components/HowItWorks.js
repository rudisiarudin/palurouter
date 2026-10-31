"use client";

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Observe & Ingest",
      desc: "Intersept request prompt, kalkulasi estimasi token, verifikasi otentikasi API Key klien, dan periksa sisa kuota saldo Rupiah (Rp) dalam hitungan milidetik.",
      tag: "Token Parsing / Auth Verification",
    },
    {
      num: "02",
      title: "Model & Smart Route",
      desc: "Arahkan traffic ke provider dengan latensi terendah (OpenAI, Claude, DeepSeek). Jika terjadi HTTP 429 atau 503, engine otomatis failover ke node cadangan seketika.",
      tag: "Cascade Failover / Load Balancing",
    },
    {
      num: "03",
      title: "Stream & Monetize",
      desc: "Teruskan SSE stream token ke klien tanpa latency overhead. Catat riwayat pemakaian token, audit log, dan potong saldo prabayar secara real-time.",
      tag: "Zero-Latency SSE / Instant Billing",
    },
  ];

  return (
    <section className="py-24 border-b border-white/[0.08] bg-[#041410]" id="how-it-works">
      <div className="max-w-7xl mx-auto px-6 grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        
        {/* Left Column: Heading & Philosophy */}
        <div className="flex flex-col gap-5">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#5eead4]">
            INFERENCE ARCHITECTURE
          </p>
          <h2 className="text-3xl sm:text-5xl font-semibold leading-[1.05] text-white">
            Zero downtime at the point of inference.
          </h2>
          <p className="text-base leading-7 text-[#9eb3ad]">
            PALU Router didesain sebagai security & routing layer terpadu di antara aplikasi Anda dan upstream AI foundation models. Menjamin setiap prompt sampai ke tujuan tanpa hambatan rate-limit.
          </p>
          <div className="pt-2">
            <a 
              href="#developer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#5eead4] hover:text-[#78f7e2] transition-colors"
            >
              <span>Explore SDKs and Integrations</span>
              <span>→</span>
            </a>
          </div>
        </div>

        {/* Right Column: Proximus-style 01 / 02 / 03 Numbered Matrix Cards */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#051c17]/60 backdrop-blur-md overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
          {steps.map((step, idx) => (
            <div 
              key={step.num}
              className={`grid gap-4 p-7 md:grid-cols-[100px_1fr] transition-colors hover:bg-white/[0.02] ${
                idx !== steps.length - 1 ? "border-b border-white/[0.08]" : ""
              }`}
            >
              <span className="font-mono text-sm font-bold text-[#5eead4]">{step.num}</span>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                  <span className="text-[10px] font-mono text-[#9eb3ad] bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
                    {step.tag}
                  </span>
                </div>
                <p className="text-sm leading-6 text-[#9eb3ad]">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

