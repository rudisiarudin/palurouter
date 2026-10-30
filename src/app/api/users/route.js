import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDashboardAuthSession } from "@/lib/auth/dashboardSession";
import { getAllUsers, createUser } from "@/lib/localDb";

async function requireAdmin() {
  const cookieStore = await cookies();
  const session = await getDashboardAuthSession(cookieStore.get("auth_token")?.value);
  if (!session || !session.authenticated) {
    return { error: "Unauthorized", status: 401 };
  }
  // If role is not admin (e.g. standard user), forbid
  if (session.role && session.role !== "admin") {
    return { error: "Forbidden: Admin access required", status: 403 };
  }
  return { session };
}

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const users = await getAllUsers();
    return NextResponse.json({ users });
  } catch (error) {
    console.error("[USERS_API] GET error:", error);
    return NextResponse.json({ error: "Failed to list users" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { email, password, name, role, balance } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await createUser({
      email,
      password,
      name,
      role: role === "admin" ? "admin" : "user",
      balance: Number(balance) || 0,
    });

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    console.error("[USERS_API] POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to create user" }, { status: 400 });
  }
}
