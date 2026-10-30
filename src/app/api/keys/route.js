import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getApiKeys, createApiKey, getUserById } from "@/lib/localDb";
import { getConsistentMachineId } from "@/shared/utils/machineId";
import { getDashboardAuthSession } from "@/lib/auth/dashboardSession";

export const dynamic = "force-dynamic";

// GET /api/keys - List API keys (scoped to client if not admin)
export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = await getDashboardAuthSession(cookieStore.get("auth_token")?.value);
    
    // If logged in as client, only fetch their keys
    const isClient = session?.role === "client" && session?.userId;
    const keys = await getApiKeys(isClient ? session.userId : null);

    return NextResponse.json({ keys });
  } catch (error) {
    console.log("Error fetching keys:", error);
    return NextResponse.json({ error: "Failed to fetch keys" }, { status: 500 });
  }
}

// POST /api/keys - Create new API key
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const session = await getDashboardAuthSession(cookieStore.get("auth_token")?.value);
    const body = await request.json();
    const { name, balance, creditLimit, rateLimitRpm } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const machineId = await getConsistentMachineId();
    const isClient = session?.role === "client" && session?.userId;
    
    let keyBalance = balance;
    if (isClient) {
      // Inherit client's balance if not explicitly specified
      const clientUser = await getUserById(session.userId);
      keyBalance = clientUser ? clientUser.balance : 0;
    }

    const apiKey = await createApiKey(name, machineId, {
      userId: session?.userId || null,
      balance: keyBalance,
      creditLimit: creditLimit || keyBalance,
      rateLimitRpm,
    });

    return NextResponse.json({
      key: apiKey.key,
      name: apiKey.name,
      id: apiKey.id,
      machineId: apiKey.machineId,
      userId: apiKey.userId,
      balance: apiKey.balance,
      creditLimit: apiKey.creditLimit,
      spent: apiKey.spent,
      rateLimitRpm: apiKey.rateLimitRpm,
    }, { status: 201 });
  } catch (error) {
    console.log("Error creating key:", error);
    return NextResponse.json({ error: "Failed to create key" }, { status: 500 });
  }
}
