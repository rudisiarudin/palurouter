"use client";

import { useState, useEffect } from "react";
import { Card, Button, Input } from "@/shared/components";
import { Sparkles, Shield, User, Lock, Mail, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [tab, setTab] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resetHint, setResetHint] = useState("");
  const [retryAfter, setRetryAfter] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasPassword, setHasPassword] = useState(null);
  const [authMode, setAuthMode] = useState("password");
  const [ssoType, setSsoType] = useState("oidc");
  const [oidcConfigured, setOidcConfigured] = useState(false);
  const [oidcLoginLabel, setOidcLoginLabel] = useState("Sign in with OIDC");
  const [samlConfigured, setSamlConfigured] = useState(false);
  const [samlLoginLabel, setSamlLoginLabel] = useState("Sign in with SAML SSO");
  const [mustChange, setMustChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  // Countdown for rate-limit
  useEffect(() => {
    if (retryAfter <= 0) return;
    const id = setInterval(() => setRetryAfter((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [retryAfter]);

  useEffect(() => {
    async function checkAuth() {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

      try {
        const res = await fetch(`${baseUrl}/api/auth/status`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data.authenticated === true || data.requireLogin === false) {
            window.location.assign("/dashboard");
            return;
          }
          setHasPassword(!!data.hasPassword);
          setAuthMode(data.authMode || "password");
          setSsoType(data.ssoType || "oidc");
          setOidcConfigured(data.oidcConfigured === true);
          setOidcLoginLabel(data.oidcLoginLabel || "Sign in with OIDC");
          setSamlConfigured(data.samlConfigured === true);
          setSamlLoginLabel(data.samlLoginLabel || "Sign in with SAML SSO");
        } else {
          setHasPassword(true);
        }
      } catch (err) {
        clearTimeout(timeoutId);
        setHasPassword(true);
      }
    }
    checkAuth();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResetHint("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.mustChangePassword) {
          setMustChange(true);
          return;
        }
        window.location.assign("/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "Password atau email salah");
        if (data.resetHint) setResetHint(data.resetHint);
        if (data.retryAfter) setRetryAfter(Number(data.retryAfter));
      }
    } catch (err) {
      setError("Terjadi kesalahan saat masuk. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, name }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Pendaftaran berhasil! Mengalihkan ke dashboard...");
        setTimeout(() => {
          window.location.assign("/dashboard");
        }, 1000);
      } else {
        setError(data.error || "Gagal mendaftar");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat pendaftaran. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: password, newPassword }),
      });
      if (res.ok) {
        window.location.assign("/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "Gagal mengatur password baru");
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleOidcLogin = () => {
    window.location.href = "/api/auth/oidc/start";
  };

  const handleSamlLogin = () => {
    window.location.href = "/api/auth/saml/start";
  };

  const isSsoEnabled = ["sso", "oidc", "saml", "both"].includes(authMode);
  const activeSsoType = ssoType || (authMode === "saml" ? "saml" : "oidc");

  const samlAvailable = isSsoEnabled && activeSsoType === "saml" && samlConfigured;
  const oidcAvailable = isSsoEnabled && activeSsoType === "oidc" && oidcConfigured;
  const ssoAvailable = samlAvailable || oidcAvailable;
  const passwordAvailable = authMode === "password" || authMode === "both" || !ssoAvailable;

  if (hasPassword === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground text-xs mt-4">Memuat sistem autentikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-background to-background pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-zinc-900 border border-zinc-800 mb-3 shadow-md">
            <img src="/logo-white.png" alt="Logo" className="h-10 w-auto object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">PALU Router Gateway</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Portal Akses & Monetisasi API Model AI Terpadu
          </p>
        </div>

        <Card className="p-6 rounded-xl border border-border bg-card shadow-sm">
          {mustChange ? (
            <form onSubmit={handleSetNewPassword} className="flex flex-col gap-4">
              <p className="text-xs text-amber-500 text-center">
                Atur password baru sebelum mengakses dashboard dari jarak jauh.
              </p>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-foreground">Password Baru</label>
                <Input
                  type="password"
                  placeholder="Masukkan password baru"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoFocus
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
              </div>
              <Button type="submit" variant="primary" className="w-full" loading={loading} disabled={!newPassword}>
                Simpan Password Baru
              </Button>
            </form>
          ) : (
            <div className="flex flex-col gap-5">
              {/* Tabs Switcher: Masuk vs Daftar */}
              <div className="grid grid-cols-2 p-1 rounded-lg bg-muted/60 border border-border/60 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => {
                    setTab("login");
                    setError("");
                    setSuccessMsg("");
                  }}
                  className={`py-1.5 rounded-md transition-all cursor-pointer ${
                    tab === "login"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Masuk (Sign In)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab("register");
                    setError("");
                    setSuccessMsg("");
                  }}
                  className={`py-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    tab === "register"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sparkles className="size-3 text-emerald-400" />
                  Daftar Klien Baru
                </button>
              </div>

              {/* SSO Buttons if active */}
              {tab === "login" && ssoAvailable && (
                <div className="flex flex-col gap-2">
                  {samlAvailable && (
                    <Button type="button" variant="outline" className="w-full" onClick={handleSamlLogin}>
                      {samlLoginLabel}
                    </Button>
                  )}
                  {oidcAvailable && (
                    <Button type="button" variant="outline" className="w-full" onClick={handleOidcLogin}>
                      {oidcLoginLabel}
                    </Button>
                  )}
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase">
                      <span className="bg-card px-2 text-muted-foreground">atau masuk dengan akun</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Form LOGIN */}
              {tab === "login" && (
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">Email / Username</label>
                    <Input
                      type="text"
                      placeholder="admin@router.local atau email Anda"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoFocus={!oidcAvailable}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-foreground">Password</label>
                    </div>
                    <Input
                      type="password"
                      placeholder="Masukkan password akun"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

                  {retryAfter > 0 && (
                    <p className="text-xs text-amber-500">
                      Akun terkunci sementara. Coba lagi dalam <span className="font-mono">{retryAfter}s</span>.
                    </p>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full font-semibold cursor-pointer"
                    loading={loading}
                    disabled={retryAfter > 0}
                  >
                    {retryAfter > 0 ? `Tunggu ${retryAfter} detik` : "Masuk ke Dashboard"}
                  </Button>
                </form>
              )}

              {/* Form REGISTER */}
              {tab === "register" && (
                <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-start gap-2">
                    <Sparkles className="size-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Bonus Pendaftaran Klien</p>
                      <p className="text-[11px] text-emerald-300/80">
                        Dapatkan saldo <strong>Rp 5.000 (Gratis)</strong> untuk langsung uji coba model AI kami di Cursor, Claude Code, atau chat playground.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">Nama Lengkap / Perusahaan</label>
                    <Input
                      type="text"
                      placeholder="e.g. John Doe / PT Solusi AI"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">Email Aktif</label>
                    <Input
                      type="email"
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">Password (min. 6 karakter)</label>
                    <Input
                      type="password"
                      placeholder="Buat password aman"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
                  {successMsg && <p className="text-xs text-emerald-400 font-medium">{successMsg}</p>}

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full font-semibold cursor-pointer mt-1"
                    loading={loading}
                    disabled={!email || !password || password.length < 6}
                  >
                    Daftar Sekarang & Ambil Saldo
                  </Button>

                  <p className="text-[11px] text-center text-muted-foreground">
                    Dengan masuk, Anda menyetujui ketentuan akses API PALU Router.
                  </p>
                </form>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
