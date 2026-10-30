"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import {
  Card,
  Button,
  Input,
  Modal,
  CardSkeleton,
  Toggle,
  ConfirmModal,
} from "@/shared/components";
import { useCopyToClipboard } from "@/shared/hooks/useCopyToClipboard";
import {
  TUNNEL_BENEFITS,
  STATUS_POLL_FAST_MS,
  REACHABLE_MISS_THRESHOLD,
  CLIENT_PING_FAST_MS,
} from "./endpointConstants";
import { clientPingUrl, clientPingAny } from "./endpointPing";
import useSettingsStore from "@/store/settingsStore";
import EndpointRow from "./components/EndpointRow";
import StatusAlert from "./components/StatusAlert";
import Tooltip from "./components/Tooltip";
import SecurityWarning from "./components/SecurityWarning";
import KeyAccessControls from "./components/KeyAccessControls";
import { formatRupiah } from "@/shared/utils/currency";
import {
  Activity,
  Bot,
  Cpu,
  ShieldCheck,
  Copy,
  Check,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Key,
  Terminal,
  Globe,
  Radio,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Lock,
  Unlock,
  Power,
  Code2,
  Server,
  Layers,
  ChevronRight,
  Coins,
  DollarSign,
  TrendingUp,
  Wallet,
  Search,
} from "lucide-react";

export default function APIPageClient({ machineId }) {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyBalance, setNewKeyBalance] = useState("");
  const [newKeyRpm, setNewKeyRpm] = useState("");
  const [topUpKey, setTopUpKey] = useState(null);
  const [topUpAmount, setTopUpAmount] = useState("50000");
  const [isToppingUp, setIsToppingUp] = useState(false);
  const [createdKey, setCreatedKey] = useState(null);
  const [confirmState, setConfirmState] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [requireApiKey, setRequireApiKey] = useState(false);
  const [requireLogin, setRequireLogin] = useState(true);
  const [hasPassword, setHasPassword] = useState(true);
  const [tunnelDashboardAccess, setTunnelDashboardAccess] = useState(false);

  // Quick-test code snippets tab
  const [codeTab, setCodeTab] = useState("curl");
  const [connectedProvidersCount, setConnectedProvidersCount] = useState(0);

  // Cloudflare Tunnel state
  const [tunnelChecking, setTunnelChecking] = useState(true);
  const [tunnelEnabled, setTunnelEnabled] = useState(false);
  const [tunnelReachable, setTunnelReachable] = useState(false);
  const [tunnelUrl, setTunnelUrl] = useState("");
  const [tunnelPublicUrl, setTunnelPublicUrl] = useState("");
  const [tunnelLoading, setTunnelLoading] = useState(false);
  const [tunnelProgress, setTunnelProgress] = useState("");
  const [tunnelStatus, setTunnelStatus] = useState(null);
  const [showEnableTunnelModal, setShowEnableTunnelModal] = useState(false);
  const [showDisableTunnelModal, setShowDisableTunnelModal] = useState(false);

  // Tailscale state
  const [tsEnabled, setTsEnabled] = useState(false);
  const [tsReachable, setTsReachable] = useState(false);
  const [tsUrl, setTsUrl] = useState("");
  const [tsLoading, setTsLoading] = useState(false);
  const [tsProgress, setTsProgress] = useState("");
  const [tsStatus, setTsStatus] = useState(null);
  const [tsAuthUrl, setTsAuthUrl] = useState("");
  const [tsAuthLabel, setTsAuthLabel] = useState("");
  const [tsInstalled, setTsInstalled] = useState(null);
  const [tsInstalling, setTsInstalling] = useState(false);
  const [tsInstallLog, setTsInstallLog] = useState([]);
  const [tsSudoPassword, setTsSudoPassword] = useState("");
  const [tsConnecting, setTsConnecting] = useState(false);
  const [showTsModal, setShowTsModal] = useState(false);
  const [showDisableTsModal, setShowDisableTsModal] = useState(false);
  const tsLogRef = useRef(null);

  const tunnelMissRef = useRef(0);
  const tsMissRef = useRef(0);
  const tunnelClientReachableRef = useRef(false);
  const tsClientReachableRef = useRef(false);
  const tunnelEverReachableRef = useRef(false);
  const tsEverReachableRef = useRef(false);
  const [tunnelEverReachable, setTunnelEverReachable] = useState(false);
  const [tsEverReachable, setTsEverReachable] = useState(false);

  const [visibleKeys, setVisibleKeys] = useState(new Set());
  const [baseUrl] = useState(() => (typeof window !== "undefined" ? `${window.location.origin}/v1` : "/v1"));
  const isRemoteHost = typeof window !== "undefined" && !["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

  const { copied, copy } = useCopyToClipboard();

  const isLoginUnsafe = !requireLogin || !hasPassword;
  const unsafeReason = !requireLogin
    ? 'Enable "Require login" and set a custom password before activating the tunnel.'
    : "Change the default dashboard password before activating the tunnel.";

  const updateReachable = useCallback((_unused, clientRef, missRef, setter, everRef, everSetter) => {
    const reachable = clientRef.current;
    if (reachable) {
      missRef.current = 0;
      setter(true);
      if (!everRef.current) {
        everRef.current = true;
        everSetter(true);
      }
    } else {
      missRef.current += 1;
      if (missRef.current >= REACHABLE_MISS_THRESHOLD) setter(false);
    }
  }, []);

  const syncTunnelStatus = useCallback(async () => {
    try {
      const statusRes = await fetch("/api/tunnel/status", { cache: "no-store" });
      if (!statusRes.ok) return;
      const data = await statusRes.json();
      const tEnabled = data.tunnel?.settingsEnabled ?? data.tunnel?.enabled ?? false;
      const tUrl = data.tunnel?.tunnelUrl || "";
      setTunnelUrl(tUrl);
      setTunnelPublicUrl(data.tunnel?.publicUrl || "");
      setTunnelEnabled(tEnabled);
      updateReachable(null, tunnelClientReachableRef, tunnelMissRef, setTunnelReachable, tunnelEverReachableRef, setTunnelEverReachable);

      const tsEn = data.tailscale?.settingsEnabled ?? data.tailscale?.enabled ?? false;
      const tsUrlVal = data.tailscale?.tunnelUrl || "";
      setTsUrl(tsUrlVal);
      setTsEnabled(tsEn);
      updateReachable(null, tsClientReachableRef, tsMissRef, setTsReachable, tsEverReachableRef, setTsEverReachable);
    } catch {
      /* ignore */
    }
  }, [updateReachable]);

  const loadSettings = useCallback(async () => {
    try {
      const [settingsData, statusRes] = await Promise.all([
        useSettingsStore.getState().fetchSettings(),
        fetch("/api/tunnel/status", { cache: "no-store" }),
      ]);
      if (settingsData) {
        setRequireApiKey(settingsData.requireApiKey || false);
        setRequireLogin(settingsData.requireLogin !== false);
        setHasPassword(settingsData.hasPassword || false);
        setTunnelDashboardAccess(settingsData.tunnelDashboardAccess || false);
      }
      if (statusRes.ok) {
        const data = await statusRes.json();
        const tEnabled = data.tunnel?.settingsEnabled ?? data.tunnel?.enabled ?? false;
        const tUrl = data.tunnel?.tunnelUrl || "";
        setTunnelUrl(tUrl);
        setTunnelPublicUrl(data.tunnel?.publicUrl || "");
        setTunnelEnabled(tEnabled);
        updateReachable(null, tunnelClientReachableRef, tunnelMissRef, setTunnelReachable, tunnelEverReachableRef, setTunnelEverReachable);

        const tsEn = data.tailscale?.settingsEnabled ?? data.tailscale?.enabled ?? false;
        const tsUrlVal = data.tailscale?.tunnelUrl || "";
        setTsUrl(tsUrlVal);
        setTsEnabled(tsEn);
        updateReachable(null, tsClientReachableRef, tsMissRef, setTsReachable, tsEverReachableRef, setTsEverReachable);
      }
    } catch (error) {
      console.log("Error loading settings:", error);
    } finally {
      setTunnelChecking(false);
    }
  }, [updateReachable]);

  const fetchData = useCallback(async () => {
    try {
      const [keysRes, providersRes] = await Promise.all([
        fetch("/api/keys"),
        fetch("/api/providers").catch(() => null),
      ]);
      const data = await keysRes.json();
      if (keysRes.ok) setKeys(data.keys || []);

      if (providersRes && providersRes.ok) {
        const provData = await providersRes.json();
        const conns = provData.connections || [];
        const active = conns.filter(
          (c) => c.isActive !== false && (c.testStatus === "active" || c.testStatus === "success" || !c.testStatus)
        ).length;
        setConnectedProvidersCount(active || conns.length || 0);
      }
    } catch (error) {
      console.log("Error fetching keys:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tsLogRef.current) tsLogRef.current.scrollTop = tsLogRef.current.scrollHeight;
  }, [tsInstallLog]);

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchData(), loadSettings()]);
    };
    init();
  }, [fetchData, loadSettings]);

  useEffect(() => {
    const anyEnabled = tunnelEnabled || tsEnabled;
    if (!anyEnabled) return;
    const tunnelHealthy = !tunnelEnabled || tunnelReachable;
    const tsHealthy = !tsEnabled || tsReachable;
    const allHealthy = tunnelHealthy && tsHealthy;
    const onVisible = () => {
      if (!document.hidden) syncTunnelStatus();
    };
    document.addEventListener("visibilitychange", onVisible);
    if (allHealthy) return () => document.removeEventListener("visibilitychange", onVisible);
    const timer = setInterval(() => {
      if (!document.hidden) syncTunnelStatus();
    }, STATUS_POLL_FAST_MS);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [tunnelEnabled, tsEnabled, tunnelReachable, tsReachable, syncTunnelStatus]);

  useEffect(() => {
    const probeBoth = async () => {
      if (document.hidden) return;
      if (tunnelEnabled && (tunnelUrl || tunnelPublicUrl)) {
        const ok = await clientPingAny(tunnelPublicUrl, tunnelUrl);
        tunnelClientReachableRef.current = ok;
        if (ok) {
          tunnelMissRef.current = 0;
          setTunnelReachable(true);
          if (!tunnelEverReachableRef.current) {
            tunnelEverReachableRef.current = true;
            setTunnelEverReachable(true);
          }
        } else {
          tunnelMissRef.current += 1;
          if (tunnelMissRef.current >= REACHABLE_MISS_THRESHOLD) setTunnelReachable(false);
        }
      } else {
        tunnelClientReachableRef.current = false;
      }
      if (tsEnabled && tsUrl) {
        const ok = await clientPingUrl(tsUrl);
        tsClientReachableRef.current = ok;
        if (ok) {
          tsMissRef.current = 0;
          setTsReachable(true);
          if (!tsEverReachableRef.current) {
            tsEverReachableRef.current = true;
            setTsEverReachable(true);
          }
        } else {
          tsMissRef.current += 1;
          if (tsMissRef.current >= REACHABLE_MISS_THRESHOLD) setTsReachable(false);
        }
      } else {
        tsClientReachableRef.current = false;
      }
    };
    const anyEnabled = (tunnelEnabled && (tunnelUrl || tunnelPublicUrl)) || (tsEnabled && tsUrl);
    if (!anyEnabled) return;
    probeBoth();
    const tunnelHealthy = !tunnelEnabled || tunnelReachable;
    const tsHealthy = !tsEnabled || tsReachable;
    if (tunnelHealthy && tsHealthy) return;
    const id = setInterval(probeBoth, CLIENT_PING_FAST_MS);
    return () => clearInterval(id);
  }, [tunnelEnabled, tunnelUrl, tunnelPublicUrl, tsEnabled, tsUrl, tunnelReachable, tsReachable]);

  const handleTunnelDashboardAccess = async (value) => {
    try {
      const updated = await useSettingsStore.getState().patchSettings({ tunnelDashboardAccess: value });
      if (updated) setTunnelDashboardAccess(value);
    } catch (error) {
      console.log("Error updating tunnelDashboardAccess:", error);
    }
  };

  const handleRequireApiKey = async (value) => {
    try {
      const updated = await useSettingsStore.getState().patchSettings({ requireApiKey: value });
      if (updated) setRequireApiKey(value);
    } catch (error) {
      console.log("Error updating requireApiKey:", error);
    }
  };


  const pingTunnelHealth = async (publicUrl, url) => {
    const ok = await clientPingAny(publicUrl, url);
    tunnelClientReachableRef.current = ok;
    tunnelMissRef.current = ok ? 0 : 1;
    setTunnelReachable(ok);
    if (ok) {
      tunnelEverReachableRef.current = true;
      setTunnelEverReachable(true);
    }
    return ok;
  };

  const handleEnableTunnel = async () => {
    setTunnelLoading(true);
    setTunnelStatus(null);
    setTunnelProgress("Starting tunnel...");
    setShowEnableTunnelModal(false);
    try {
      const res = await fetch("/api/tunnel/enable", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        const url = data.tunnelUrl || "";
        setTunnelUrl(url);
        setTunnelPublicUrl(data.publicUrl || "");
        setTunnelEnabled(true);
        await pingTunnelHealth(data.publicUrl, url);
      } else {
        setTunnelStatus({ type: "error", message: data.error || "Failed to start tunnel" });
      }
    } catch (e) {
      setTunnelStatus({ type: "error", message: e.message });
    } finally {
      setTunnelLoading(false);
      setTunnelProgress("");
    }
  };

  const handleDisableTunnel = async () => {
    setTunnelLoading(true);
    setTunnelStatus(null);
    try {
      const res = await fetch("/api/tunnel/disable", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setTunnelEnabled(false);
        setTunnelUrl("");
        setTunnelPublicUrl("");
        setShowDisableTunnelModal(false);
        setTunnelStatus({ type: "success", message: "Tunnel disabled" });
      } else {
        setTunnelStatus({ type: "error", message: data.error || "Failed to disable tunnel" });
      }
    } catch (e) {
      setTunnelStatus({ type: "error", message: e.message });
    } finally {
      setTunnelLoading(false);
    }
  };

  const pingTsHealth = async (url) => {
    const ok = await clientPingUrl(url);
    tsClientReachableRef.current = ok;
    tsMissRef.current = ok ? 0 : 1;
    setTsReachable(ok);
    if (ok) {
      tsEverReachableRef.current = true;
      setTsEverReachable(true);
    }
    return ok;
  };

  const checkTailscaleInstalled = async () => {
    try {
      const res = await fetch("/api/tunnel/tailscale-check");
      const data = await res.json();
      if (res.ok) {
        setTsInstalled(data.installed);
        return data;
      }
    } catch {
      /* ignore */
    }
    return null;
  };

  const handleInstallTailscale = async () => {
    setTsInstalling(true);
    setTsInstallLog(["Starting installation..."]);
    try {
      const res = await fetch("/api/tunnel/tailscale-install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sudoPassword: tsSudoPassword || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        setTsInstalled(true);
        setTsInstallLog((prev) => [...prev, "Installation successful!"]);
      } else {
        setTsStatus({ type: "error", message: data.error || "Installation failed" });
      }
    } catch (e) {
      setTsStatus({ type: "error", message: e.message });
    } finally {
      setTsInstalling(false);
    }
  };

  const handleConnectTailscale = async () => {
    setTsLoading(true);
    setTsConnecting(true);
    setTsProgress("Connecting to Tailscale...");
    setTsStatus(null);
    setShowTsModal(false);
    try {
      const res = await fetch("/api/tunnel/tailscale-enable", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setTsUrl(data.tunnelUrl || "");
        setTsEnabled(true);
        await pingTsHealth(data.tunnelUrl);
      } else if (data.authUrl) {
        setTsAuthUrl(data.authUrl);
        setTsAuthLabel("Open Authentication Page");
      } else {
        setTsStatus({ type: "error", message: data.error || "Failed to connect to Tailscale" });
      }
    } catch (e) {
      setTsStatus({ type: "error", message: e.message });
    } finally {
      setTsLoading(false);
      setTsConnecting(false);
      setTsProgress("");
    }
  };

  const handleDisableTailscale = async () => {
    setTsLoading(true);
    setTsStatus(null);
    try {
      const res = await fetch("/api/tunnel/tailscale-disable", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setTsEnabled(false);
        setTsUrl("");
        setShowDisableTsModal(false);
        setTsStatus({ type: "success", message: "Tailscale disabled" });
      } else {
        setTsStatus({ type: "error", message: data.error || "Failed to disable Tailscale" });
      }
    } catch (e) {
      setTsStatus({ type: "error", message: e.message });
    } finally {
      setTsLoading(false);
    }
  };

  const handleOpenTsModal = async () => {
    setTsStatus(null);
    setTsInstallLog([]);
    const data = await checkTailscaleInstalled();
    if (data?.installed && data?.hasCachedPassword) {
      handleConnectTailscale();
    } else {
      setShowTsModal(true);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;

    try {
      const payload = { name: newKeyName.trim() };
      if (newKeyBalance.trim() !== "" && !isNaN(parseFloat(newKeyBalance))) {
        payload.balance = parseFloat(newKeyBalance);
      }
      if (newKeyRpm.trim() !== "" && !isNaN(parseInt(newKeyRpm, 10))) {
        payload.rateLimitRpm = parseInt(newKeyRpm, 10);
      }

      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        setCreatedKey(data.key);
        await fetchData();
        setNewKeyName("");
        setNewKeyBalance("");
        setNewKeyRpm("");
        setShowAddModal(false);
      }
    } catch (error) {
      console.log("Error creating key:", error);
    }
  };

  const handleTopUpKey = async () => {
    if (!topUpKey || !topUpAmount || isNaN(parseFloat(topUpAmount))) return;
    setIsToppingUp(true);
    try {
      const res = await fetch(`/api/keys/${topUpKey.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topUpAmount: parseFloat(topUpAmount) }),
      });
      if (res.ok) {
        await fetchData();
        setTopUpKey(null);
        setTopUpAmount("50000");
      }
    } catch (error) {
      console.log("Error topping up key:", error);
    } finally {
      setIsToppingUp(false);
    }
  };

  const handleDeleteKey = async (id) => {
    setConfirmState({
      title: "Delete API Key",
      message: "Are you sure you want to permanently delete this API key?",
      onConfirm: async () => {
        setConfirmState(null);
        try {
          const res = await fetch(`/api/keys/${id}`, { method: "DELETE" });
          if (res.ok) {
            setKeys(keys.filter((k) => k.id !== id));
            setVisibleKeys((prev) => {
              const next = new Set(prev);
              next.delete(id);
              return next;
            });
          }
        } catch (error) {
          console.log("Error deleting key:", error);
        }
      },
    });
  };

  const handleToggleKey = async (id, isActive) => {
    try {
      const res = await fetch(`/api/keys/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (res.ok) {
        setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, isActive } : k)));
      }
    } catch (error) {
      console.log("Error toggling key:", error);
    }
  };

  const handleUpdateKeyAccess = async (id, access) => {
    try {
      const res = await fetch(`/api/keys/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access }),
      });
      if (res.ok) {
        const data = await res.json();
        setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, access: data.key?.access || access } : k)));
      }
    } catch (error) {
      console.log("Error updating key access:", error);
    }
  };

  const maskKey = (fullKey) => {
    if (!fullKey || fullKey.length <= 10) return fullKey || "";
    return fullKey.slice(0, 6) + "•".repeat(fullKey.length - 10) + fullKey.slice(-4);
  };

  const toggleKeyVisibility = (keyId) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(keyId)) next.delete(keyId);
      else next.add(keyId);
      return next;
    });
  };


  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }  const currentEndpoint = baseUrl;
  const activeKeySample = keys.find((k) => k.isActive !== false)?.key || keys[0]?.key || "sk-your-udi-key";
  const activeKeysCount = keys.filter((k) => k.isActive !== false).length;
  const totalBalance = keys.reduce((acc, k) => acc + (k.balance !== null && k.balance !== undefined ? Number(k.balance) : 0), 0);
  const totalSpent = keys.reduce((acc, k) => acc + (k.spent ? Number(k.spent) : 0), 0);
  const cappedKeysCount = keys.filter((k) => k.balance !== null && k.balance !== undefined).length;
  const filteredKeys = keys.filter(
    (k) =>
      (k.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (k.key || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const codeSnippets = {
    curl: `curl ${currentEndpoint}/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${activeKeySample}" \\
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello from PALU Router gateway!"}],
    "stream": true
  }'`,
    python: `from openai import OpenAI

# PALU Router OpenAI-compatible client
client = OpenAI(
    base_url="${currentEndpoint}",
    api_key="${activeKeySample}"
)

stream = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Explain PALU Router in 2 sentences."}],
    stream=True,
)

for chunk in stream:
    print(chunk.choices[0].delta.content or "", end="", flush=True)`,
    javascript: `import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "${currentEndpoint}",
  apiKey: "${activeKeySample}",
});

const stream = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "Explain PALU Router in 2 sentences." }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || "");
}`,
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Hero KPI Metrics Grid - shadcn Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: API Keys Aktif */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-medium text-muted-foreground">API Keys Aktif</span>
            <Key className="size-4 text-muted-foreground" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {activeKeysCount} <span className="text-sm font-normal text-muted-foreground">/ {keys.length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
              {requireApiKey ? (
                <span className="inline-flex items-center gap-1 text-emerald-500 font-medium">
                  <Lock className="size-3" /> Auth Diwajibkan
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-500 font-medium">
                  <Unlock className="size-3" /> Open Gateway
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Metric 2: Total Saldo Klien (Rupiah) */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-medium text-muted-foreground">Total Saldo Klien</span>
            <Wallet className="size-4 text-muted-foreground" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-foreground truncate">
              {formatRupiah(totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 truncate">
              {cappedKeysCount} key dengan kuota IDR
            </p>
          </div>
        </div>

        {/* Metric 3: Total Penggunaan (Rupiah) */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-medium text-muted-foreground">Total Penggunaan</span>
            <TrendingUp className="size-4 text-muted-foreground" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-foreground truncate">
              {formatRupiah(totalSpent, { showDecimals: true })}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 truncate">
              Biaya token upstream terpotong
            </p>
          </div>
        </div>

        {/* Metric 4: Gateway Status */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-medium text-muted-foreground">Gateway Status</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[11px] font-medium">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ONLINE
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tracking-tight text-foreground truncate">
              :{typeof window !== "undefined" ? window.location.port || "80" : "20127"}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
              <Server className="size-3 text-muted-foreground" />
              {connectedProvidersCount} provider upstream aktif
            </p>
          </div>
        </div>
      </div>

      {/* Main Endpoint URLs Card */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            Routing Endpoints
          </h2>
          <span className="text-xs text-muted-foreground font-mono">
            OpenAI & Anthropic Compatible
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {/* Local */}
          <EndpointRow
            label="Local"
            url={currentEndpoint}
            copyId="local_url"
            copied={copied}
            onCopy={copy}
          />

          {/* Cloudflare Tunnel */}
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-mono font-medium px-2.5 py-1 rounded-md shrink-0 min-w-[90px] text-center border ${
                tunnelEnabled ? "bg-secondary text-foreground border-border font-semibold" : "bg-muted/50 text-muted-foreground border-border"
              }`}
            >
              Tunnel
            </span>
            {tunnelEnabled && !tunnelLoading && tunnelReachable ? (
              <>
                <Input
                  value={`${tunnelPublicUrl || tunnelUrl}/v1`}
                  readOnly
                  className="flex-1 font-mono text-sm bg-background border-border"
                />
                <button
                  type="button"
                  onClick={() => copy(`${tunnelPublicUrl || tunnelUrl}/v1`, "tunnel_url")}
                  className="inline-flex items-center justify-center size-9 rounded-md border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-colors shrink-0 cursor-pointer"
                  title="Copy tunnel URL"
                >
                  {copied === "tunnel_url" ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDisableTunnelModal(true)}
                  className="inline-flex items-center justify-center size-9 rounded-md border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors shrink-0 cursor-pointer"
                  title="Disable Tunnel"
                >
                  <Power className="size-4" />
                </button>
              </>
            ) : tunnelEnabled && !tunnelLoading && !tunnelReachable ? (
              <>
                <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-md border border-amber-300 dark:border-amber-800 bg-amber-500/10 text-sm text-amber-600 dark:text-amber-400">
                  <span className="size-2 rounded-full bg-amber-500 animate-ping" />
                  {tunnelEverReachable ? "Tunnel reconnecting..." : "Tunnel checking..."}
                </div>
                <button
                  type="button"
                  onClick={() => setShowDisableTunnelModal(true)}
                  className="inline-flex items-center justify-center size-9 rounded-md border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors shrink-0 cursor-pointer"
                  title="Disable Tunnel"
                >
                  <Power className="size-4" />
                </button>
              </>
            ) : tunnelLoading ? (
              <>
                <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-input text-sm text-muted-foreground">
                  <span className="size-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  {tunnelProgress || "Creating tunnel..."}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTunnelLoading(false);
                    setTunnelProgress("");
                  }}
                  className="inline-flex items-center justify-center size-9 rounded-md border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors shrink-0"
                  title="Stop"
                >
                  <Power className="size-4" />
                </button>
              </>
            ) : tunnelStatus?.type === "error" ? (
              <>
                <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-md border border-red-300 dark:border-red-800 bg-red-500/10 text-sm text-red-600 dark:text-red-400">
                  {tunnelStatus.message}
                </div>
                <Button size="sm" onClick={() => setShowEnableTunnelModal(true)}>
                  Enable
                </Button>
              </>
            ) : tunnelChecking ? (
              <>
                <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-input text-sm text-muted-foreground">
                  <span className="size-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  Checking status...
                </div>
                <button
                  type="button"
                  onClick={() => setTunnelChecking(false)}
                  className="inline-flex items-center justify-center size-9 rounded-md border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors shrink-0"
                  title="Stop"
                >
                  <Power className="size-4" />
                </button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (isLoginUnsafe) {
                    setTunnelStatus({ type: "error", message: `Security required: ${unsafeReason}` });
                    return;
                  }
                  if (!requireApiKey) {
                    setTunnelStatus({
                      type: "error",
                      message: 'Security required: Enable "Require API key" before activating the tunnel.',
                    });
                    return;
                  }
                  setShowEnableTunnelModal(true);
                }}
              >
                Enable
              </Button>
            )}
          </div>

          {/* Tailscale */}
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-mono font-medium px-2.5 py-1 rounded-md shrink-0 min-w-[90px] text-center border ${
                tsEnabled ? "bg-secondary text-foreground border-border font-semibold" : "bg-muted/50 text-muted-foreground border-border"
              }`}
            >
              Tailscale
            </span>
            {tsEnabled && !tsLoading && tsReachable ? (
              <>
                <Input
                  value={`${tsUrl}/v1`}
                  readOnly
                  className="flex-1 font-mono text-sm bg-background border-border"
                />
                <button
                  type="button"
                  onClick={() => copy(`${tsUrl}/v1`, "ts_url")}
                  className="inline-flex items-center justify-center size-9 rounded-md border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-colors shrink-0 cursor-pointer"
                  title="Copy Tailscale URL"
                >
                  {copied === "ts_url" ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDisableTsModal(true)}
                  className="inline-flex items-center justify-center size-9 rounded-md border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors shrink-0 cursor-pointer"
                  title="Disable Tailscale"
                >
                  <Power className="size-4" />
                </button>
              </>
            ) : tsEnabled && !tsLoading && !tsReachable ? (
              <>
                <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-md border border-amber-300 dark:border-amber-800 bg-amber-500/10 text-sm text-amber-600 dark:text-amber-400">
                  <span className="size-2 rounded-full bg-amber-500 animate-ping" />
                  {tsEverReachable ? "Tailscale reconnecting..." : "Tailscale checking..."}
                </div>
                <button
                  type="button"
                  onClick={() => setShowDisableTsModal(true)}
                  className="inline-flex items-center justify-center size-9 rounded-md border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors shrink-0"
                  title="Disable Tailscale"
                >
                  <Power className="size-4" />
                </button>
              </>
            ) : tsLoading || tsConnecting ? (
              <>
                <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-input text-sm text-muted-foreground">
                  <span className="size-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  {tsProgress || "Connecting to Tailscale..."}
                </div>
                {tsAuthUrl && (
                  <Button
                    size="sm"
                    onClick={() => window.open(tsAuthUrl, "tailscale_auth", "width=600,height=700,noopener,noreferrer")}
                  >
                    {tsAuthLabel || "Open"}
                  </Button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setTsLoading(false);
                    setTsConnecting(false);
                    setTsProgress("");
                  }}
                  className="inline-flex items-center justify-center size-9 rounded-md border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors shrink-0"
                  title="Stop"
                >
                  <Power className="size-4" />
                </button>
              </>
            ) : tsStatus?.type === "error" ? (
              <>
                <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-md border border-red-300 dark:border-red-800 bg-red-500/10 text-sm text-red-600 dark:text-red-400">
                  {tsStatus.message}
                </div>
                <Button size="sm" onClick={handleOpenTsModal}>
                  Enable
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (isLoginUnsafe) {
                    setTsStatus({ type: "error", message: `Security required: ${unsafeReason}` });
                    return;
                  }
                  handleOpenTsModal();
                }}
              >
                Enable
              </Button>
            )}
          </div>
        </div>

        {/* Security warnings */}
        {isLoginUnsafe && !tunnelEnabled && !tsEnabled && (
          <div className="mt-4">
            <SecurityWarning message={unsafeReason} action={{ label: "Open settings", href: "/dashboard/profile" }} />
          </div>
        )}

        {(tunnelEnabled || tsEnabled) && (
          <div className="mt-4 flex flex-col gap-2">
            {!requireApiKey && (
              <SecurityWarning
                message="Require API key is disabled — your endpoint is publicly accessible without authentication."
                action={{ label: "Enable", href: "#require-api-key" }}
              />
            )}
            {(!requireLogin || !hasPassword) && (
              <SecurityWarning
                message={
                  !requireLogin
                    ? "Require login is disabled — anyone can access your dashboard via tunnel."
                    : "Dashboard uses the default password — change it in Profile settings."
                }
                action={{
                  label: !requireLogin ? "Enable" : "Change password",
                  href: "/dashboard/profile",
                }}
              />
            )}
          </div>
        )}

        {/* Tunnel dashboard access option */}
        {(tunnelEnabled || tsEnabled) && (
          <div className="mt-4 pt-4 border-t border-border flex items-center gap-3">
            <Toggle checked={tunnelDashboardAccess} onChange={() => handleTunnelDashboardAccess(!tunnelDashboardAccess)} />
            <div className="flex items-center gap-1.5">
              <p className="font-medium text-sm">Allow dashboard access via tunnel</p>
              <Tooltip text="When enabled, the dashboard can be accessed through your tunnel or Tailscale URL (login still required). When disabled, dashboard access via tunnel/Tailscale is completely blocked." />
            </div>
          </div>
        )}
      </Card>

      {/* Developer Quick-Start & Testing Console */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Code2 className="size-4 text-muted-foreground" />
            <h2 className="text-base font-semibold tracking-tight text-foreground">Test Gateway & API Calls</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-border bg-muted/50 p-1 text-xs">
              <button
                type="button"
                onClick={() => setCodeTab("curl")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  codeTab === "curl" ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                cURL
              </button>
              <button
                type="button"
                onClick={() => setCodeTab("python")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  codeTab === "python" ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Python
              </button>
              <button
                type="button"
                onClick={() => setCodeTab("javascript")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  codeTab === "javascript" ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Node.js
              </button>
            </div>
            <Link
              href="/dashboard/chat"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-secondary hover:bg-secondary/80 text-foreground text-xs font-medium transition-colors"
            >
              <Bot className="size-3.5" />
              Open Playground
            </Link>
          </div>
        </div>

        <div className="relative group rounded-lg border border-border bg-zinc-950 text-zinc-100 p-4 font-mono text-xs overflow-x-auto leading-relaxed">
          <button
            type="button"
            onClick={() => copy(codeSnippets[codeTab], `code_${codeTab}`)}
            className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-sans transition-colors cursor-pointer border border-zinc-700/60"
            title="Copy snippet"
          >
            {copied === `code_${codeTab}` ? (
              <>
                <Check className="size-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
          <pre className="selection:bg-zinc-800">{codeSnippets[codeTab]}</pre>
        </div>
      </Card>

      {/* API Keys Management */}
      <Card id="require-api-key">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Key className="size-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold tracking-tight text-foreground">API Keys</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground font-mono font-medium border border-border/50">
                {keys.length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Kunci akses dan alokasi saldo kredit (Rp) untuk menghubungkan aplikasi atau klien Anda
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Cari kunci atau nama..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-xs rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <Button onClick={() => setShowAddModal(true)} size="sm">
              <Plus className="size-4 mr-1.5" />
              Buat API Key
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-lg border border-border/80 bg-muted/20 mb-6">
          <div className="space-y-0.5">
            <p className="font-medium text-sm text-foreground">Wajibkan Autentikasi API Key</p>
            <p className="text-xs text-muted-foreground">
              Request ke <code>/v1/*</code> tanpa Bearer token yang valid akan ditolak (401 Unauthorized)
            </p>
          </div>
          <Toggle checked={requireApiKey} onChange={() => handleRequireApiKey(!requireApiKey)} />
        </div>

        {isRemoteHost && !requireApiKey && (
          <div className="mb-4 -mt-2">
            <SecurityWarning message="Endpoint is exposed without an API key." />
          </div>
        )}

        {filteredKeys.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-xl">
            <div className="inline-flex items-center justify-center size-12 rounded-full bg-secondary text-muted-foreground mb-3 border border-border/50">
              <Key className="size-6" />
            </div>
            <p className="text-foreground font-semibold mb-1">
              {searchQuery ? "Tidak ada API key yang cocok" : "Belum ada API key dibuat"}
            </p>
            <p className="text-xs text-muted-foreground mb-4 max-w-sm mx-auto">
              {searchQuery
                ? `Pencarian "${searchQuery}" tidak menemukan hasil. Coba periksa kata kunci lain.`
                : "Buat API key baru untuk menghubungkan Cursor, Claude Code, Cline, atau klien Anda."}
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowAddModal(true)} size="sm">
                <Plus className="size-4 mr-1.5" />
                Buat Kunci Pertama
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredKeys.map((key) => (
              <div
                key={key.id}
                className={`group rounded-lg border border-border/70 bg-card p-4 transition-all hover:border-zinc-700 hover:shadow-xs space-y-3 ${
                  key.isActive === false ? "opacity-60 bg-muted/10" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <p className="text-sm font-semibold text-foreground tracking-tight">{key.name}</p>
                    {key.isActive === false ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        PAUSED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        ACTIVE
                      </span>
                    )}

                    {/* Balance & Quota Badge */}
                    {key.balance === null || key.balance === undefined ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-secondary text-secondary-foreground border border-border/50 flex items-center gap-1">
                        ⚡ Kuota Tanpa Batas (Unlimited)
                      </span>
                    ) : Number(key.balance) <= 0 ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                        💰 Saldo: Rp 0 (Habis)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        💰 Saldo: {formatRupiah(key.balance)}
                      </span>
                    )}

                    {/* RPM Limit Badge */}
                    {key.rateLimitRpm ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {key.rateLimitRpm} RPM
                      </span>
                    ) : null}

                    {/* Top Up Action Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setTopUpKey(key);
                        setTopUpAmount("50000");
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-medium bg-secondary hover:bg-secondary/80 text-foreground border border-border/60 transition-all cursor-pointer"
                      title="Top up saldo kredit untuk klien ini"
                    >
                      <Coins className="size-3 text-muted-foreground" />
                      + Isi Saldo
                    </button>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Toggle
                      size="sm"
                      checked={key.isActive ?? true}
                      onChange={(checked) => {
                        if (key.isActive && !checked) {
                          setConfirmState({
                            title: "Pause API Key",
                            message: `Pause API key "${key.name}"?\n\nThis key will stop working immediately until resumed.`,
                            onConfirm: async () => {
                              setConfirmState(null);
                              handleToggleKey(key.id, checked);
                            },
                          });
                        } else {
                          handleToggleKey(key.id, checked);
                        }
                      }}
                      title={key.isActive ? "Pause key" : "Resume key"}
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteKey(key.id)}
                      className="p-1.5 hover:bg-red-500/10 rounded-md text-red-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all cursor-pointer"
                      title="Delete key"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                {/* Key Token String & Copy */}
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="text-xs font-mono text-zinc-300 bg-zinc-950 px-2.5 py-1 rounded-md border border-zinc-800 break-all select-all">
                    {visibleKeys.has(key.id) ? key.key : maskKey(key.key)}
                  </code>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleKeyVisibility(key.id)}
                      className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                      title={visibleKeys.has(key.id) ? "Hide key" : "Show key"}
                    >
                      {visibleKeys.has(key.id) ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => copy(key.key, key.id)}
                      className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                      title="Copy key"
                    >
                      {copied === key.id ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Key Metadata & Restrict Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1 border-t border-border/40 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span>Dibuat: {new Date(key.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="font-mono text-foreground font-medium">Terpakai: {formatRupiah(key.spent || 0, { showDecimals: true })}</span>
                  </div>

                  <KeyAccessControls
                    apiKey={key}
                    onChange={(access) => handleUpdateKeyAccess(key.id, access)}
                    onRequestRestrict={() =>
                      setConfirmState({
                        title: "Restrict API Key",
                        message: `Restrict API key "${key.name}"?\n\nIt will only be able to call the combos and models you add. Until you add one, it can call nothing.`,
                        onConfirm: async () => {
                          setConfirmState(null);
                          handleUpdateKeyAccess(key.id, { restricted: true, allow: key.access?.allow || [] });
                        },
                      })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Key Modal */}
      <Modal
        isOpen={showAddModal}
        title="Create API Key"
        onClose={() => {
          setShowAddModal(false);
          setNewKeyName("");
        }}
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Key Name"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="e.g. Production Backend, Client App, Cursor"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Saldo Prabayar (Rp / IDR)"
              type="number"
              step="1000"
              min="0"
              value={newKeyBalance}
              onChange={(e) => setNewKeyBalance(e.target.value)}
              placeholder="e.g. 50000 (Kosong = Unlimited)"
            />
            <Input
              label="Rate Limit (RPM)"
              type="number"
              step="1"
              min="1"
              value={newKeyRpm}
              onChange={(e) => setNewKeyRpm(e.target.value)}
              placeholder="e.g. 60 (Kosong = Unlimited)"
            />
          </div>
          <p className="text-[11px] text-muted-foreground -mt-1 leading-relaxed">
            💡 <strong>Siap Komersial:</strong> Atur saldo kredit dalam <strong>Rupiah (Rp)</strong> untuk jualan akses API ke klien. Sistem otomatis memotong saldo sesuai token terpakai. Jika saldo Rp 0, request otomatis ditolak (<code>402 Payment Required</code>).
          </p>
          <div className="flex gap-2 pt-1">
            <Button onClick={handleCreateKey} fullWidth disabled={!newKeyName.trim()}>
              Generate Key
            </Button>
            <Button
              onClick={() => {
                setShowAddModal(false);
                setNewKeyName("");
                setNewKeyBalance("");
                setNewKeyRpm("");
              }}
              variant="ghost"
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Created Key Modal */}
      <Modal isOpen={!!createdKey} title="API Key Created" onClose={() => setCreatedKey(null)}>
        <div className="flex flex-col gap-4">
          <div className="bg-amber-500/10 border border-amber-500/25 rounded-lg p-4">
            <p className="text-sm text-amber-600 dark:text-amber-400 mb-1 font-semibold">
              Save your key now
            </p>
            <p className="text-xs text-amber-700/80 dark:text-amber-300/80">
              Store this key securely. You can view or copy it anytime from the API Keys manager.
            </p>
          </div>
          <div className="flex gap-2">
            <Input value={createdKey || ""} readOnly className="flex-1 font-mono text-sm bg-background" />
            <Button
              variant="secondary"
              onClick={() => copy(createdKey, "created_key")}
            >
              {copied === "created_key" ? (
                <>
                  <Check className="size-4 mr-1 text-primary" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="size-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <Button onClick={() => setCreatedKey(null)} fullWidth>
            Done
          </Button>
        </div>
      </Modal>

      {/* Enable Tunnel Modal */}
      <Modal
        isOpen={showEnableTunnelModal}
        title="Enable Cloudflare Tunnel"
        onClose={() => setShowEnableTunnelModal(false)}
      >
        <div className="flex flex-col gap-4">
          <div className="bg-muted/40 border border-border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Globe className="size-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold mb-1">Public Cloudflare Tunnel</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Securely expose PALU Router to the internet without opening ports or configuring static IPs. Connect from Cursor, remote agents, and webhooks anywhere.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {TUNNEL_BENEFITS.map((benefit) => (
              <div key={benefit.title} className="flex flex-col items-center text-center p-3 rounded-lg bg-card border border-border">
                <span className="text-xs font-semibold">{benefit.title}</span>
                <span className="text-[11px] text-muted-foreground mt-0.5">{benefit.desc}</span>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-muted-foreground">
            Requires outbound TCP/UDP port 7844. Initialization usually takes 10–20 seconds.
          </p>

          <div className="flex gap-2">
            <Button onClick={handleEnableTunnel} fullWidth>
              Start Tunnel
            </Button>
            <Button onClick={() => setShowEnableTunnelModal(false)} variant="ghost" fullWidth>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Disable Cloudflare Tunnel Modal */}
      <Modal
        isOpen={showDisableTunnelModal}
        title="Disable Tunnel"
        onClose={() => !tunnelLoading && setShowDisableTunnelModal(false)}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            The Cloudflare tunnel will be terminated. Remote requests over the tunnel URL will stop functioning.
          </p>
          <div className="flex gap-2">
            <Button onClick={handleDisableTunnel} fullWidth disabled={tunnelLoading} variant="danger">
              {tunnelLoading ? "Disabling..." : "Disable Tunnel"}
            </Button>
            <Button onClick={() => setShowDisableTunnelModal(false)} variant="ghost" fullWidth disabled={tunnelLoading}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Tailscale Modal */}
      <Modal
        isOpen={showTsModal}
        title="Tailscale Funnel"
        onClose={() => {
          if (!tsInstalling) {
            setShowTsModal(false);
            setTsSudoPassword("");
            setTsStatus(null);
          }
        }}
      >
        <div className="flex flex-col gap-4">
          {tsInstalled === null && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="size-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              Checking Tailscale status...
            </p>
          )}

          {tsInstalled === false && !tsInstalling && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">Tailscale is not installed. Install it to enable Tailscale Funnel.</p>
              <div className="flex gap-2">
                <Button onClick={handleInstallTailscale} fullWidth>
                  Install Tailscale
                </Button>
                <Button onClick={() => setShowTsModal(false)} variant="ghost" fullWidth>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {tsInstalling && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="size-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                Installing Tailscale...
              </div>
              {tsInstallLog.length > 0 && (
                <div ref={tsLogRef} className="bg-black/5 dark:bg-white/5 rounded p-2 max-h-40 overflow-y-auto font-mono text-xs text-muted-foreground">
                  {tsInstallLog.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tsInstalled === true && !tsInstalling && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-emerald-500 font-medium">
                <Check className="size-4" />
                Tailscale installed & ready
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleConnectTailscale()} fullWidth>
                  Connect Funnel
                </Button>
                <Button onClick={() => setShowTsModal(false)} variant="ghost" fullWidth>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {tsStatus && <StatusAlert status={tsStatus} />}
        </div>
      </Modal>

      {/* Disable Tailscale Modal */}
      <Modal
        isOpen={showDisableTsModal}
        title="Disable Tailscale"
        onClose={() => !tsLoading && setShowDisableTsModal(false)}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Tailscale Funnel will be stopped. Remote access via Tailscale URL will cease.
          </p>
          <div className="flex gap-2">
            <Button onClick={handleDisableTailscale} fullWidth disabled={tsLoading} variant="danger">
              {tsLoading ? "Disabling..." : "Disable Tailscale"}
            </Button>
            <Button onClick={() => setShowDisableTsModal(false)} variant="ghost" fullWidth disabled={tsLoading}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Top Up Modal */}
      <Modal
        isOpen={!!topUpKey}
        title={`Top Up Saldo Kredit — ${topUpKey?.name || ""}`}
        onClose={() => setTopUpKey(null)}
      >
        <div className="flex flex-col gap-4">
          <div className="bg-muted/40 border border-border rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Saldo Saat Ini:</span>
              <span className="font-mono font-semibold text-foreground">
                {topUpKey?.balance === null || topUpKey?.balance === undefined
                  ? "⚡ Kuota Tanpa Batas (Unlimited)"
                  : formatRupiah(topUpKey.balance)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Total Terpakai:</span>
              <span className="font-mono text-muted-foreground">
                {formatRupiah(topUpKey?.spent || 0, { showDecimals: true })}
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">
              Pilihan Cepat (Preset)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[10000, 25000, 50000, 100000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTopUpAmount(String(amt))}
                  className={`py-1.5 text-xs font-mono font-medium rounded-md border transition-all cursor-pointer ${
                    topUpAmount === String(amt)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card hover:bg-accent text-foreground border-border"
                  }`}
                >
                  +{amt >= 1000 ? `${amt / 1000}rb` : amt}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Jumlah Top Up (Rp / IDR)"
            type="number"
            step="1000"
            min="1000"
            value={topUpAmount}
            onChange={(e) => setTopUpAmount(e.target.value)}
            placeholder="50000"
          />

          <div className="flex gap-2 pt-1">
            <Button
              onClick={handleTopUpKey}
              fullWidth
              disabled={isToppingUp || !topUpAmount || isNaN(parseFloat(topUpAmount)) || parseFloat(topUpAmount) <= 0}
            >
              {isToppingUp ? "Menambahkan Saldo..." : `Tambah ${formatRupiah(topUpAmount)} Saldo`}
            </Button>
            <Button
              onClick={() => setTopUpKey(null)}
              variant="ghost"
              fullWidth
              disabled={isToppingUp}
            >
              Batal
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={!!confirmState}
        onClose={() => setConfirmState(null)}
        onConfirm={confirmState?.onConfirm}
        title={confirmState?.title || "Confirm"}
        message={confirmState?.message}
        variant="danger"
      />
    </div>
  );
}

APIPageClient.propTypes = {
  machineId: PropTypes.string.isRequired,
};
