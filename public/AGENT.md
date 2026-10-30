# PALU Router — AI Agent Integration Guide (`AGENT.md`)

This guide provides instructions, endpoints, and configuration for autonomous AI agents (Hermes Agent, Claude Code, Cursor, Cline, Roo Code, Windsurf, OpenCode, AutoGen, CrewAI, etc.) to integrate with **PALU Router Gateway**.

---

## 1. Quick Setup & Base URL

Point your AI agent or OpenAI/Anthropic SDK to the PALU Router Gateway:

- **Base URL (OpenAI-compatible):**
  ```http
  http://localhost:20127/v1
  ```
  *(Or replace `localhost:20127` with your tailored tunnel / domain, e.g., `https://your-domain.com/v1`)*

- **Base URL (Anthropic-compatible):**
  ```http
  http://localhost:20127
  ```

- **Authentication Header:**
  ```http
  Authorization: Bearer <YOUR_API_KEY>
  ```
  *(Or header `x-api-key: <YOUR_API_KEY>`)*

---

## 2. Supported Capabilities & Endpoints

| Capability | Path | Standard Method | Protocol / Notes |
| :--- | :--- | :--- | :--- |
| **Chat & Code Completion** | `/v1/chat/completions` | `POST` | OpenAI & Anthropic messages format with streaming (SSE) |
| **Model Discovery** | `/v1/models` | `GET` | Returns list of available upstream & custom combo models |
| **Embeddings** | `/v1/embeddings` | `POST` | OpenAI format for semantic search & vector retrieval |
| **Image Generation** | `/v1/images/generations` | `POST` | DALL-E, FLUX, Midjourney & Stable Diffusion adapters |
| **Audio Speech (TTS)** | `/v1/audio/speech` | `POST` | Text-to-Speech (OpenAI, ElevenLabs, Edge TTS) |
| **Audio Transcription (STT)**| `/v1/audio/transcriptions` | `POST` | Whisper & audio-to-text transcription |
| **Web Search Engine** | `/v1/search` | `POST` / `GET` | Web search synthesis (Tavily, Brave, SearXNG) |
| **Web Page Fetcher** | `/v1/web/fetch` | `POST` | Clean markdown/HTML crawler (Firecrawl, Jina) |

---

## 3. Configuration Examples for AI Agents

### Python (OpenAI SDK)
```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:20127/v1",
    api_key="sk-palu-your-api-key"
)

response = client.chat.completions.create(
    model="claude-3-7-sonnet", # Or gpt-4o, deepseek-v3, combo-auto
    messages=[
        {"role": "system", "content": "You are a helpful autonomous coding agent."},
        {"role": "user", "content": "Fix bug in app.py"}
    ],
    temperature=0.2
)
print(response.choices[0].message.content)
```

### TypeScript / Node.js
```typescript
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "http://localhost:20127/v1",
  apiKey: process.env.PALU_ROUTER_API_KEY || "sk-palu-your-key",
});

const completion = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Ping!" }],
});
console.log(completion.choices[0].message.content);
```

### cURL
```bash
curl http://localhost:20127/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-palu-your-key" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello PALU!"}]
  }'
```

---

## 4. Smart Routing & Fallback
PALU Router automatically manages load-balancing, rate-limits, and token-cost optimization via upstream providers (OpenAI, Anthropic, Google Gemini, DeepSeek, Groq, OpenRouter, Ollama, etc.).

For multi-agent workflows, specify custom combo models configured in **Dashboard → Combo & Routing** for zero-downtime failover.
