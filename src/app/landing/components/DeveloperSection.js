"use client";
import { useState } from "react";

const SNIPPETS = {
  curl: `# Direct cURL request through PALU Router Gateway
curl http://localhost:20128/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-palu-live-user_key" \\
  -d '{
    "model": "claude-3-7-sonnet",
    "messages": [{"role": "user", "content": "Analyze system architecture"}],
    "stream": true
  }'`,

  python: `# Python with standard openai library
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:20128/v1",
    api_key="sk-palu-live-user_key"
)

response = client.chat.completions.create(
    model="claude-3-7-sonnet",
    messages=[{"role": "user", "content": "Hello PALU Router!"}],
    stream=True
)

for chunk in response:
    print(chunk.choices[0].delta.content or "", end="")`,

  typescript: `// TypeScript / Next.js with OpenAI SDK
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "http://localhost:20128/v1",
  apiKey: process.env.PALU_ROUTER_API_KEY,
});

export async function POST(req: Request) {
  const stream = await openai.chat.completions.create({
    model: "deepseek-r1",
    messages: [{ role: "user", content: "Optimize SQL query plan" }],
    stream: true,
  });
  return new Response(stream.toReadableStream());
}`,

  cursor: `# In Cursor / Cline / Windsurf settings:
# Override OpenAI Base URL:
http://localhost:20128/v1

# API Key:
sk-palu-live-user_key

# Custom Models available:
- claude-3-7-sonnet
- gpt-4o
- deepseek-r1
- gemini-2-0-flash`,
};

export default function DeveloperSection() {
  const [activeTab, setActiveTab] = useState("curl");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SNIPPETS[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-24 px-6 border-b border-white/[0.08] bg-[#041410]" id="developer">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#5eead4] mb-3">
              DEVELOPER SDKS & PROTOCOLS
            </p>
            <h2 className="text-3xl sm:text-5xl font-semibold leading-[1.05] text-white">
              Fits the exact way you build.
            </h2>
          </div>
          <p className="text-[#9eb3ad] text-sm sm:text-base max-w-md leading-relaxed">
            One standard API contract. Works instantly with the official OpenAI SDKs, LangChain, LlamaIndex, Cursor, and custom HTTP clients.
          </p>
        </div>

        {/* Code Terminal Box */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#051c17]/90 shadow-[0_25px_60px_rgba(0,0,0,0.5)] overflow-hidden">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] px-5 py-3 bg-[#041612]">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-white/10"></span>
              <span className="h-3 w-3 rounded-full bg-white/10"></span>
              <span className="h-3 w-3 rounded-full bg-white/10"></span>
              
              {/* Tab Selector Pills */}
              <div className="flex items-center gap-1.5 ml-4">
                {[
                  { id: "curl", label: "cURL" },
                  { id: "python", label: "Python" },
                  { id: "typescript", label: "TypeScript" },
                  { id: "cursor", label: "Cursor / Cline" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1 rounded-full text-xs font-mono font-medium transition-colors cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-[#5eead4]/15 text-[#5eead4] border border-[#5eead4]/30"
                        : "text-[#9eb3ad] hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-[#9eb3ad] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
            >
              <span>{copied ? "Copied ✓" : "Copy Code"}</span>
            </button>
          </div>

          {/* Code Viewer Body */}
          <div className="p-6 font-mono text-xs sm:text-sm text-[#d1e5e0] leading-relaxed overflow-x-auto bg-[#020e0b]">
            <pre className="selection:bg-[#5eead4]/20 selection:text-[#5eead4]">
              <code>{SNIPPETS[activeTab]}</code>
            </pre>
          </div>

          {/* Footer note */}
          <div className="px-6 py-3 border-t border-white/[0.06] bg-[#041612] flex items-center justify-between text-xs font-mono text-[#9eb3ad]">
            <span>ENDPOINT: http://localhost:20128/v1</span>
            <span className="text-[#5eead4]">OPENAI PROTOCOL COMPLIANT</span>
          </div>
        </div>
      </div>
    </section>
  );
}
