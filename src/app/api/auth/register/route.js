import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createUser, getUserByEmail, createApiKey } from "@/lib/localDb";
import { setDashboardAuthCookie } from "@/lib/auth/dashboardSession";
import { getConsistentMachineId } from "@/shared/utils/machineId";

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Email tidak valid" }, { status: 400 });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan login." },
        { status: 400 }
      );
    }

    // Initial trial balance Rp 5.000 for new client sign-ups
    const INITIAL_TRIAL_BALANCE_IDR = 5000;

    const user = await createUser({
      email,
      password,
      name: name?.trim() || email.split("@")[0],
      role: "client",
      balance: INITIAL_TRIAL_BALANCE_IDR,
    });

    // Auto-create initial default API key for this client
    try {
      const machineId = await getConsistentMachineId();
      await createApiKey("Default Key", machineId, {
        userId: user.id,
        balance: INITIAL_TRIAL_BALANCE_IDR,
      });
    } catch (keyErr) {
      console.warn("[Register] Could not auto-generate initial key:", keyErr.message);
    }

    const cookieStore = await cookies();
    await setDashboardAuthCookie(cookieStore, request, {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      balance: user.balance,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        balance: user.balance,
      },
    });
  } catch (error) {
    console.error("[Register Error]:", error);
    return NextResponse.json({ error: error.message || "Gagal mendaftar" }, { status: 500 });
  }
}
