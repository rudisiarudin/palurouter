export function createCachedSseResponse(cachedEntry, model) {
  const encoder = new TextEncoder();
  const id = `chatcmpl_cache_${Date.now()}`;
  const text = cachedEntry.text || cachedEntry.response?.choices?.[0]?.message?.content || "";

  const stream = new ReadableStream({
    start(controller) {
      // Chunk 1: Role
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            id,
            object: "chat.completion.chunk",
            created: Math.floor(cachedEntry.createdAt / 1000),
            model: model || cachedEntry.model,
            choices: [{ index: 0, delta: { role: "assistant" }, finish_reason: null }],
          })}\n\n`
        )
      );

      // Chunk 2: Content
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            id,
            object: "chat.completion.chunk",
            created: Math.floor(cachedEntry.createdAt / 1000),
            model: model || cachedEntry.model,
            choices: [{ index: 0, delta: { content: text }, finish_reason: null }],
          })}\n\n`
        )
      );

      // Chunk 3: Stop
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            id,
            object: "chat.completion.chunk",
            created: Math.floor(cachedEntry.createdAt / 1000),
            model: model || cachedEntry.model,
            choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
          })}\n\n`
        )
      );

      // Chunk 4: Done sentinel
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Cache": "HIT",
      "X-Cache-Latency": "0ms",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export function createCachedJsonResponse(cachedEntry, model) {
  const text = cachedEntry.text || cachedEntry.response?.choices?.[0]?.message?.content || "";
  const payload = cachedEntry.response || {
    id: `chatcmpl_cache_${Date.now()}`,
    object: "chat.completion",
    created: Math.floor(cachedEntry.createdAt / 1000),
    model: model || cachedEntry.model,
    choices: [
      {
        index: 0,
        message: { role: "assistant", content: text },
        finish_reason: "stop",
      },
    ],
    usage: cachedEntry.usage || {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    },
  };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "X-Cache": "HIT",
      "X-Cache-Latency": "0ms",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
