"use client";

const FEATURES = [
  { 
    icon: "currency_exchange", 
    title: "Bayar Rupiah (Rp)", 
    desc: "Top-up saldo instan via QRIS tanpa kartu kredit luar negeri dan tanpa potongan kurs aneh.", 
    colors: {
      border: "hover:border-teal-500/50",
      bg: "hover:bg-teal-500/5",
      iconBg: "bg-teal-500/10",
      iconText: "text-teal-400",
      titleHover: "group-hover:text-teal-300"
    }
  },
  { 
    icon: "shield_with_heart", 
    title: "Zero-Downtime Fallback", 
    desc: "Jika provider utama rate-limit (429) atau down (503), otomatis beralih ke provider backup tanpa error.", 
    colors: {
      border: "hover:border-emerald-500/50",
      bg: "hover:bg-emerald-500/5",
      iconBg: "bg-emerald-500/10",
      iconText: "text-emerald-400",
      titleHover: "group-hover:text-emerald-300"
    }
  },
  { 
    icon: "terminal", 
    title: "100% Tools Compatible", 
    desc: "Bisa langsung dipakai di Cursor, Windsurf, Cline, Roo Code, Claude Code, Python, dan Node.js.", 
    colors: {
      border: "hover:border-teal-500/50",
      bg: "hover:bg-teal-500/5",
      iconBg: "bg-teal-500/10",
      iconText: "text-teal-400",
      titleHover: "group-hover:text-teal-300"
    }
  },
  { 
    icon: "speed", 
    title: "Smart Token Caching", 
    desc: "Teknologi prompt caching pintar menghemat hingga 80% biaya token dan mempercepat streaming jawaban.", 
    colors: {
      border: "hover:border-cyan-500/50",
      bg: "hover:bg-cyan-500/5",
      iconBg: "bg-cyan-500/10",
      iconText: "text-cyan-400",
      titleHover: "group-hover:text-cyan-300"
    }
  },
  { 
    icon: "monitoring", 
    title: "Transparansi Biaya Real-time", 
    desc: "Pantau pemakaian token per request, durasi latency, dan sisa saldo Rupiah Anda setiap detik.", 
    colors: {
      border: "hover:border-teal-500/50",
      bg: "hover:bg-teal-500/5",
      iconBg: "bg-teal-500/10",
      iconText: "text-teal-400",
      titleHover: "group-hover:text-teal-300"
    }
  },
  { 
    icon: "lock", 
    title: "Keamanan Enterprise", 
    desc: "API Key unik terisolasi, enkripsi token, dan tidak ada penyimpanan prompt sensitif user.", 
    colors: {
      border: "hover:border-teal-500/50",
      bg: "hover:bg-teal-500/5",
      iconBg: "bg-teal-500/10",
      iconText: "text-teal-400",
      titleHover: "group-hover:text-teal-300"
    }
  },
  { 
    icon: "terminal", 
    title: "CLI Support", 
    desc: "Works with Claude Code, Codex, Cline, Cursor, and more.", 
    colors: {
      border: "hover:border-emerald-500/50",
      bg: "hover:bg-emerald-500/5",
      iconBg: "bg-emerald-500/10",
      iconText: "text-emerald-500",
      titleHover: "group-hover:text-emerald-400"
    }
  },
  { 
    icon: "dashboard", 
    title: "Dashboard", 
    desc: "Visual dashboard for real-time traffic analysis.", 
    colors: {
      border: "hover:border-fuchsia-500/50",
      bg: "hover:bg-fuchsia-500/5",
      iconBg: "bg-fuchsia-500/10",
      iconText: "text-fuchsia-500",
      titleHover: "group-hover:text-fuchsia-400"
    }
  },
];

export default function Features() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto" id="features">
      <div>
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Kenapa Memilih PALU Router?</h2>
          <p className="text-gray-400 text-base">
            Infrastruktur AI gateway dirancang khusus untuk kenyamanan developer, startup, dan pengguna AI di Indonesia.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature) => (
            <div 
              key={feature.title}
              className={`p-6 rounded-xl bg-[#0f1c1b] border border-teal-900/30 ${feature.colors.border} ${feature.colors.bg} transition-all duration-300 group hover:scale-[1.02]`}
            >
              <div className={`w-10 h-10 rounded-lg ${feature.colors.iconBg} flex items-center justify-center mb-4 ${feature.colors.iconText} group-hover:scale-110 transition-transform duration-300`}>
                <span className="material-symbols-outlined">{feature.icon}</span>
              </div>
              <h3 className={`text-lg font-bold mb-2 text-white ${feature.colors.titleHover} transition-colors`}>
                {feature.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

