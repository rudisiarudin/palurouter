"use client";

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  KeyRound,
  Users,
  Server,
  Layers,
  BarChart3,
  Gauge,
  Sparkles,
  Terminal,
  FileCode2,
  Languages,
  Network,
  Puzzle,
  Settings,
  Tv,
  ChevronDown,
  ExternalLink,
  Copy,
  Check,
  PowerOff,
  Image as ImageIcon,
  Video,
  Mic,
  Volume2,
  Globe,
  Radio,
  Cpu,
  Bot,
  MessageSquare
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { APP_CONFIG, UPDATER_CONFIG } from "@/shared/constants/config";
import { MEDIA_PROVIDER_KINDS } from "@/shared/constants/providers";
import { useCopyToClipboard } from "@/shared/hooks/useCopyToClipboard";
import useSettingsStore from "@/store/settingsStore";
import { formatRupiah } from "@/shared/utils/currency";
import Button from "./Button";
import { ConfirmModal } from "./Modal";

const VISIBLE_MEDIA_KINDS = ["embedding", "image", "video", "tts", "stt", "systemone"];
const COMBINED_WEB_ITEM = {
  id: "web",
  label: "Web Fetch & Search",
  icon: Globe,
  href: "/dashboard/media-providers/web"
};

const mediaIconMap = {
  embedding: Cpu,
  image: ImageIcon,
  video: Video,
  tts: Volume2,
  stt: Mic,
  systemone: Radio,
  web: Globe,
};

const navItems = [
  { href: "/dashboard/endpoint", label: "Endpoint & Key", icon: KeyRound },
  { href: "/dashboard/users", label: "Users & Accounts", icon: Users },
  { href: "/dashboard/chat", label: "Model Playground", icon: Bot, badge: "TEST" },
  { href: "/dashboard/providers", label: "Providers", icon: Server },
  { href: "/dashboard/combos", label: "Combo & Routing", icon: Layers },
  { href: "/dashboard/usage", label: "Usage & Analytics", icon: BarChart3 },
  { href: "/dashboard/token-saver", label: "Token Saver", icon: Sparkles },
];

const debugItems = [
  { href: "/dashboard/console-log", label: "Console Log", icon: FileCode2 },
];

const systemItems = [
  { href: "/dashboard/proxy-pools", label: "Proxy Pools", icon: Network },
  { href: "/dashboard/skills", label: "Agent (AGENT.md)", icon: Puzzle },
];

export default function Sidebar({ onClose }) {
  const pathname = usePathname();
  const [mediaOpen, setMediaOpen] = useState(false);
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [shutdownCountdown, setShutdownCountdown] = useState(0);
  const [enableTranslator, setEnableTranslator] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { copied, copy } = useCopyToClipboard(2000);

  const INSTALL_CMD = UPDATER_CONFIG.installCmdLatest;

  useEffect(() => {
    fetch("/api/auth/status")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setCurrentUser(data.user);
        } else if (data?.displayName) {
          setCurrentUser({
            name: data.displayName,
            role: "client",
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    useSettingsStore.getState().fetchSettings().then((data) => {
      if (data?.enableTranslator) setEnableTranslator(true);
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetch("/api/version")
        .then((res) => res.json())
        .then((data) => {
          if (data.hasUpdate) setUpdateInfo(data);
        })
        .catch(() => {});
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const isActive = (href) => {
    if (href === "/dashboard/endpoint") {
      return (
        pathname === "/dashboard" ||
        pathname.startsWith("/dashboard/endpoint")
      );
    }
    if (href === "/dashboard/chat") {
      return pathname.startsWith("/dashboard/chat") || pathname.startsWith("/dashboard/basic-chat");
    }
    return pathname.startsWith(href);
  };

  const isAdmin = currentUser?.role === "admin";
  const isClient = !isAdmin;

  const handleUpdate = () => {
    setShowUpdateModal(false);
    setIsUpdating(true);
  };

  const handleCopyAndShutdown = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_CMD);
    } catch {
      /* clipboard blocked */
    }
    copy(INSTALL_CMD);
    let remaining = UPDATER_CONFIG.shutdownCountdownSec;
    setShutdownCountdown(remaining);
    const timer = setInterval(() => {
      remaining -= 1;
      setShutdownCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        fetch("/api/version/shutdown", { method: "POST" }).catch(() => {});
        setIsDisconnected(true);
      }
    }, 1000);
  };

  const handleCancelUpdate = () => {
    setIsUpdating(false);
    setShutdownCountdown(0);
  };

  return (
    <>
      <aside className="flex w-64 lg:w-72 flex-col border-r border-border bg-card transition-colors duration-200 min-h-full select-none">
        {/* Header / Logo */}
        <div className="px-4 py-4 border-b border-border/60 flex flex-col gap-3">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3 group"
          >
            <div className="flex items-center justify-center size-9 rounded-xl bg-zinc-950 border border-zinc-800 p-1.5 shadow-sm transition-transform group-hover:scale-105">
              <img src="/logo-white.png" alt="Logo" className="h-full w-auto object-contain" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm tracking-tight text-foreground truncate">
                  PALU Router
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-secondary text-muted-foreground border border-border">
                  v{APP_CONFIG.version}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">AI Gateway & Router</span>
            </div>
          </Link>

          {updateInfo && (
            <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/40 p-2.5 text-xs">
              <span className="font-medium text-foreground">
                Update available: v{updateInfo.latestVersion}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <button
                  onClick={() => setShowUpdateModal(true)}
                  className="px-2.5 py-1 rounded-md bg-foreground text-background text-[11px] font-medium hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Update
                </button>
                <button
                  onClick={() => copy(INSTALL_CMD)}
                  title="Copy command"
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary border border-border text-[11px] text-muted-foreground hover:text-foreground cursor-pointer truncate"
                >
                  {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 pb-1.5 pt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {isClient ? "Client Portal" : "Gateway"}
          </div>

          {(isClient
            ? navItems.filter((i) =>
                ["/dashboard/endpoint", "/dashboard/chat", "/dashboard/usage"].includes(i.href)
              )
            : navItems
          ).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group relative",
                  active
                    ? "bg-secondary text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0 transition-colors",
                    active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-[9px] font-semibold px-1.5 py-0.2 rounded bg-secondary text-foreground border border-border">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* System Section - Only for Admin */}
          {!isClient && (
            <div className="pt-4 pb-1">
            <div className="px-3 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              System & Tools
            </div>

            {/* Media Providers Accordion */}
            <button
              onClick={() => setMediaOpen((v) => !v)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group cursor-pointer",
                pathname.startsWith("/dashboard/media-providers")
                  ? "bg-secondary text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <ImageIcon className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
              <span className="flex-1 text-left truncate">Media Providers</span>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                  mediaOpen && "rotate-180 text-foreground"
                )}
              />
            </button>

            {mediaOpen && (
              <div className="pl-4 pr-1 py-1 space-y-0.5 border-l border-border/60 ml-4 my-1">
                {MEDIA_PROVIDER_KINDS.filter((k) =>
                  VISIBLE_MEDIA_KINDS.includes(k.id)
                ).map((kind) => {
                  const KindIcon = mediaIconMap[kind.id] || Cpu;
                  const active = pathname.startsWith(
                    `/dashboard/media-providers/${kind.id}`
                  );
                  return (
                    <Link
                      key={kind.id}
                      href={`/dashboard/media-providers/${kind.id}`}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                        active
                          ? "bg-secondary text-foreground font-semibold"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <KindIcon className="size-3.5 shrink-0" />
                      <span className="truncate">{kind.label}</span>
                    </Link>
                  );
                })}
                <Link
                  key={COMBINED_WEB_ITEM.id}
                  href={COMBINED_WEB_ITEM.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                    pathname.startsWith(COMBINED_WEB_ITEM.href)
                      ? "bg-secondary text-foreground font-semibold"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Globe className="size-3.5 shrink-0" />
                  <span className="truncate">{COMBINED_WEB_ITEM.label}</span>
                </Link>
              </div>
            )}

            {systemItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group relative",
                    active
                      ? "bg-secondary text-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4 shrink-0 transition-colors",
                      active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}

            {/* Debug items */}
            {debugItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group relative",
                    active
                      ? "bg-secondary text-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4 shrink-0 transition-colors",
                      active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
          )}
        </nav>

        {/* Footer / User Profile & Logout */}
        <div className="p-3 border-t border-border/60 bg-muted/20 flex flex-col gap-1.5">
          <Link
            href="/dashboard/profile"
            onClick={onClose}
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors group",
              isActive("/dashboard/profile")
                ? "bg-secondary text-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <div className="size-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground border border-border shrink-0">
              {currentUser?.name ? currentUser.name[0].toUpperCase() : "U"}
            </div>
            <div className="flex flex-col min-w-0 text-left flex-1">
              <span className="text-xs font-semibold text-foreground truncate">
                {currentUser?.name || "Super Admin"}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                {isClient ? (
                  <span className="text-emerald-400 font-mono font-medium">
                    {formatRupiah(currentUser?.balance || 0)}
                  </span>
                ) : (
                  currentUser?.email || "Admin Gateway"
                )}
              </span>
            </div>
            <span
              className={cn(
                "px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider",
                isClient
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-primary text-primary-foreground"
              )}
            >
              {isClient ? "KLIEN" : "ADMIN"}
            </span>
          </Link>

          <button
            type="button"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.assign("/login");
            }}
            className="w-full flex items-center justify-center gap-1.5 py-1 text-[11px] text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
          >
            <PowerOff className="size-3" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Update Confirmation Modal */}
      <ConfirmModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onConfirm={handleUpdate}
        title="Update PALU Router"
        message={`Show install command for v${
          updateInfo?.latestVersion || ""
        }? You can copy it and shutdown to install manually.`}
        confirmText="Show Command"
        cancelText="Cancel"
        variant="primary"
      />

      {/* Disconnected / Updating Overlay */}
      {(isDisconnected || isUpdating) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">
          {isUpdating ? (
            <ManualUpdatePanel
              latestVersion={updateInfo?.latestVersion}
              installCmd={INSTALL_CMD}
              copied={copied}
              onCopyAndShutdown={handleCopyAndShutdown}
              onCancel={handleCancelUpdate}
              countdown={shutdownCountdown}
              isDisconnected={isDisconnected}
            />
          ) : (
            <div className="text-center p-8 bg-card border border-border rounded-2xl shadow-xl max-w-sm">
              <div className="flex items-center justify-center size-14 rounded-full bg-destructive/15 text-destructive mx-auto mb-4">
                <PowerOff className="size-7" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                Server Disconnected
              </h2>
              <p className="text-xs text-muted-foreground mb-5">
                The local 9router server has stopped.
              </p>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => globalThis.location.reload()}
              >
                Reload Page
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

Sidebar.propTypes = {
  onClose: PropTypes.func,
};

function ManualUpdatePanel({
  latestVersion,
  installCmd,
  copied,
  onCopyAndShutdown,
  onCancel,
  countdown,
  isDisconnected,
}) {
  const isCountingDown = countdown > 0;
  return (
    <div className="w-full max-w-lg rounded-2xl bg-card border border-border p-6 text-foreground shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center size-10 rounded-lg bg-amber-500/15 text-amber-500">
          <Copy className="size-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold">
            Update PALU Router{latestVersion ? ` to v${latestVersion}` : ""}
          </h2>
          <p className="text-xs text-muted-foreground">
            {isDisconnected
              ? "Server stopped. Paste the command into a terminal to install."
              : isCountingDown
              ? `Command copied. Server will stop in ${countdown}s...`
              : "Copy the install command and shutdown to proceed."}
          </p>
        </div>
      </div>

      <p className="text-xs font-medium text-foreground mb-1.5">Install command:</p>
      <div className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border font-mono text-xs text-amber-500 break-all mb-4">
        <code>{installCmd}</code>
      </div>

      <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside mb-5">
        <li>Click <strong>Copy & Shutdown</strong> below.</li>
        <li>Paste the command in your terminal and press Enter.</li>
        <li>Restart <code className="px-1 rounded bg-muted text-emerald-500">9router</code> when complete.</li>
      </ol>

      {isDisconnected ? (
        <Button
          variant="secondary"
          fullWidth
          onClick={() => globalThis.location.reload()}
        >
          Reload Page
        </Button>
      ) : (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={isCountingDown}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={onCopyAndShutdown}
            disabled={isCountingDown}
          >
            {copied
              ? "Copied — shutting down..."
              : isCountingDown
              ? `Shutting down in ${countdown}s`
              : "Copy & Shutdown"}
          </Button>
        </div>
      )}
    </div>
  );
}

ManualUpdatePanel.propTypes = {
  latestVersion: PropTypes.string,
  installCmd: PropTypes.string.isRequired,
  copied: PropTypes.bool,
  onCopyAndShutdown: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  countdown: PropTypes.number,
  isDisconnected: PropTypes.bool,
};
