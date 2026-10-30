import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSettings } from "@/lib/localDb";
import { isOidcConfigured } from "@/lib/auth/oidc";
import { isSamlConfigured } from "@/lib/auth/saml.js";
import { getDashboardAuthSession } from "@/lib/auth/dashboardSession";

export async function GET() {
  try {
    const settings = await getSettings();
    const cookieStore = await cookies();
    const session = await getDashboardAuthSession(cookieStore.get("auth_token")?.value);
    const requireLogin = settings.requireLogin !== false;
    const authMode = settings.authMode || "password";
    const ssoType = settings.ssoType || "oidc";
    const oidcName = String(session?.oidcName || "").trim();
    const oidcEmail = String(session?.oidcEmail || "").trim();
    const samlName = String(session?.samlName || "").trim();
    const samlEmail = String(session?.samlEmail || "").trim();
    const userName = String(session?.name || "").trim();
    const userEmail = String(session?.email || "").trim();
    const role = session?.role || "user";
    const balance = session?.balance !== undefined ? session.balance : null;

    const displayName =
      userName ||
      userEmail ||
      samlName ||
      samlEmail ||
      oidcName ||
      oidcEmail ||
      (session?.saml ? "SAML user" : session?.oidc ? "OIDC user" : "User");

    let userObj = null;
    if (session?.userId) {
      try {
        const { getUserById } = await import("@/lib/localDb");
        const freshUser = await getUserById(session.userId);
        if (freshUser) {
          userObj = {
            id: freshUser.id,
            email: freshUser.email,
            name: freshUser.name,
            role: freshUser.role,
            balance: freshUser.balance,
          };
        }
      } catch {}
      if (!userObj) {
        userObj = {
          id: session.userId,
          email: userEmail,
          name: userName,
          role,
          balance,
        };
      }
    }

    return NextResponse.json({
      requireLogin,
      authMode,
      ssoType,
      oidcConfigured: isOidcConfigured(settings),
      oidcLoginLabel: (settings.oidcLoginLabel || "Sign in with OIDC").trim() || "Sign in with OIDC",
      samlConfigured: isSamlConfigured(settings),
      samlLoginLabel: (settings.samlLoginLabel || "Sign in with SAML SSO").trim() || "Sign in with SAML SSO",
      hasPassword: !!settings.password,
      displayName: userObj?.name || displayName,
      loginMethod,
      authenticated: !!session,
      user: userObj,
      oidcName: oidcName || null,
      oidcEmail: oidcEmail || null,
      oidcLogin: !!session?.oidc,
      samlName: samlName || null,
      samlEmail: samlEmail || null,
      samlLogin: !!session?.saml,
    });
  } catch {
    return NextResponse.json({
      requireLogin: true,
      authMode: "password",
      ssoType: "oidc",
      oidcConfigured: false,
      oidcLoginLabel: "Sign in with OIDC",
      samlConfigured: false,
      samlLoginLabel: "Sign in with SAML SSO",
      hasPassword: false,
      displayName: "Password user",
      loginMethod: "Password",
      authenticated: false,
      oidcName: null,
      oidcEmail: null,
      oidcLogin: false,
      samlName: null,
      samlEmail: null,
      samlLogin: false,
    });
  }
}
