import { NextResponse } from "next/server";
import { getPromptCacheStats, clearPromptCache } from "@/lib/cache/promptCache.js";

export async function GET() {
  try {
    const stats = await getPromptCacheStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await clearPromptCache();
    return NextResponse.json({ success: true, message: "Prompt cache cleared successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
