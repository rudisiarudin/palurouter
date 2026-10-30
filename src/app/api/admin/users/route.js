import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAllUsers, createUser, updateUser, updateUserBalance, deleteUser, getApiKeys } from "@/lib/localDb";
import { getDashboardAuthSession } from "@/lib/auth/dashboardSession";

export const dynamic = "force-dynamic";

async function verifyAdminAuth(request) {
  const cookieStore = await cookies();
  const session = await getDashboardAuthSession(cookieStore.get("auth_token")?.value);
  if (!session) return false;
  // If role is explicitly client, reject
  if (session.role === "client") return false;
  // Any authenticated non-client session (admin, user with admin role, or legacy authenticated: true)
  if (session.authenticated) return true;
  return false;
}

// GET /api/admin/users - List all users
export async function GET(request) {
  try {
    const isAdmin = await verifyAdminAuth(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const users = await getAllUsers();
    const allKeys = await getApiKeys();

    // Attach key counts and total keys to each user
    const usersWithStats = users.map((u) => {
      const userKeys = allKeys.filter((k) => k.userId === u.id);
      const totalSpent = userKeys.reduce((acc, k) => acc + (k.spent || 0), 0);
      return {
        ...u,
        keysCount: userKeys.length,
        totalSpent,
      };
    });

    return NextResponse.json({ users: usersWithStats });
  } catch (error) {
    console.error("[Admin Users GET Error]:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST /api/admin/users - Admin create user or top-up balance
export async function POST(request) {
  try {
    const isAdmin = await verifyAdminAuth(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const body = await request.json();
    const { action, userId, amount, email, password, name, role, balance } = body;

    // Action 1: Top up balance
    if (action === "topup") {
      if (!userId || !amount || isNaN(parseFloat(amount))) {
        return NextResponse.json({ error: "Valid userId and amount are required" }, { status: 400 });
      }
      const updated = await updateUserBalance(userId, parseFloat(amount));
      return NextResponse.json({ success: true, user: updated });
    }

    // Action 2: Create new user
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const newUser = await createUser({
      email,
      password,
      name,
      role: role || "client",
      balance: balance ? parseFloat(balance) : 0,
    });

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error) {
    console.error("[Admin Users POST Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to process user operation" }, { status: 500 });
  }
}

// PATCH /api/admin/users - Update user details
export async function PATCH(request) {
  try {
    const isAdmin = await verifyAdminAuth(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, role, balance, password } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const updated = await updateUser(id, { name, role, balance, password });
    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("[Admin Users PATCH Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 500 });
  }
}

// DELETE /api/admin/users - Delete user
export async function DELETE(request) {
  try {
    const isAdmin = await verifyAdminAuth(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    await deleteUser(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Users DELETE Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to delete user" }, { status: 500 });
  }
}
