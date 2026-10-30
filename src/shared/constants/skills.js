// Agent Skills metadata — single source of truth for /dashboard/skills page.
// Each skill = 1 raw GitHub URL the user copies and pastes to any AI agent.

const REPO = "decolua/9router";
const BRANCH = "master";
const SKILL_PATH = "skills";

export const SKILLS_REPO_URL = `https://github.com/${REPO}`;
export const SKILLS_RAW_BASE = `https://raw.githubusercontent.com/${REPO}/refs/heads/${BRANCH}/${SKILL_PATH}`;
export const SKILLS_BLOB_BASE = `https://github.com/${REPO}/blob/${BRANCH}/${SKILL_PATH}`;

export const SKILLS = [
  {
    id: "palu-agent-guide",
    name: "PALU Router (AGENT.md Entry)",
    description: "Panduan integrasi lengkap untuk AI agent: Base URL, auth key, model discovery, dan routing failover.",
    endpoint: "/AGENT.md",
    icon: "hub",
    isEntry: true,
  },
  {
    id: "palu-chat",
    name: "Chat & Code Completion",
    description: "Chat & code-gen streaming via format OpenAI (/v1/chat/completions) atau Anthropic (/v1/messages).",
    endpoint: "/v1/chat/completions",
    icon: "chat",
  },
  {
    id: "palu-models",
    name: "Model Discovery",
    description: "Ambil daftar model aktif upstream dan combo alias yang tersedia di gateway.",
    endpoint: "/v1/models",
    icon: "dns",
  },
  {
    id: "palu-embeddings",
    name: "Embeddings",
    description: "Vektor representasi untuk RAG dan semantic search (OpenAI, Gemini, Mistral).",
    endpoint: "/v1/embeddings",
    icon: "scatter_plot",
  },
  {
    id: "palu-image",
    name: "Image Generation",
    description: "Text-to-image via DALL-E, FLUX, Imagen, Midjourney, dan Stable Diffusion adapter.",
    endpoint: "/v1/images/generations",
    icon: "image",
  },
  {
    id: "palu-tts",
    name: "Text-to-Speech",
    description: "Sintesis suara text-to-speech via OpenAI, ElevenLabs, dan Edge TTS.",
    endpoint: "/v1/audio/speech",
    icon: "record_voice_over",
  },
  {
    id: "palu-stt",
    name: "Speech-to-Text",
    description: "Transkripsi audio ke teks via OpenAI Whisper, Groq, dan Gemini.",
    endpoint: "/v1/audio/transcriptions",
    icon: "mic",
  },
  {
    id: "palu-web-search",
    name: "Web Search",
    description: "Pencarian internet real-time via Tavily, Brave, Serper, SearXNG, dan Xquik.",
    endpoint: "/v1/search",
    icon: "search",
  },
  {
    id: "palu-web-fetch",
    name: "Web Fetch",
    description: "Ekstraksi konten URL menjadi markdown bersih via Firecrawl dan Jina Reader.",
    endpoint: "/v1/web/fetch",
    icon: "language",
  },
];

export function getSkillRawUrl(id) {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/AGENT.md`;
  }
  return "/AGENT.md";
}

export function getSkillBlobUrl(id) {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/AGENT.md`;
  }
  return "/AGENT.md";
}
