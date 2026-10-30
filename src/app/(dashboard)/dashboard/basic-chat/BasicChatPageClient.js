"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  Send,
  Square,
  Sparkles,
  Paperclip,
  Trash2,
  Plus,
  Clock,
  Check,
  Copy,
  ChevronDown,
  Search,
  X,
  Code2,
  Zap,
  Terminal,
  ShieldAlert,
  ArrowUpRight,
  AlertTriangle,
  Menu,
  User,
  Swords,
  Timer,
  Trophy
} from "lucide-react";
import Link from "next/link";
import MarkdownContent from "./components/MarkdownContent";
import { Badge, Button } from "@/shared/components";
import { getModelsByProviderId } from "@/shared/constants/models";
import { isOpenAICompatibleProvider, isAnthropicCompatibleProvider } from "@/shared/constants/providers";
import { cn } from "@/shared/utils/cn";

const STORAGE_KEYS = {
  sessions: "udichat.sessions",
  activeSessionId: "udichat.activeSessionId",
  activeProviderId: "udichat.activeProviderId",
  draft: "udichat.draft",
  chatMode: "udichat.chatMode",
  arenaModelAId: "udichat.arenaModelAId",
  arenaModelBId: "udichat.arenaModelBId",
};

function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `chat_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function safeParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function textValue(value) {
  if (typeof value === "string") return value;
  if (value == null) return "";
  if (Array.isArray(value)) return value.map(textValue).filter(Boolean).join(" ");
  if (typeof value === "object") {
    if (typeof value.message === "string") return value.message;
    if (typeof value.error === "string") return value.error;
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function humanize(value = "") {
  return (
    String(value)
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .trim() || "Unknown"
  );
}

function formatRelativeTime(value) {
  if (!value) return "Now";
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return "Now";
  const diffMinutes = Math.max(1, Math.round((Date.now() - time) / 60000));
  if (diffMinutes < 60) return `${diffMinutes}m`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;
  return `${Math.round(diffHours / 24)}d`;
}

function makeSessionTitle(text = "") {
  const normalized = textValue(text).replace(/\s+/g, " ").trim();
  if (!normalized) return "New conversation";
  return normalized.length > 40 ? `${normalized.slice(0, 40).trimEnd()}…` : normalized;
}

function buildUserContent(message) {
  const text = textValue(message.content).trim();
  const attachments = Array.isArray(message.attachments) ? message.attachments : [];

  if (attachments.length === 0) return text;

  const content = [];
  if (text) content.push({ type: "text", text });

  for (const attachment of attachments) {
    if (attachment?.dataUrl) {
      content.push({ type: "image_url", image_url: { url: attachment.dataUrl } });
    }
  }

  return content.length > 0 ? content : text;
}

function readAssistantText(chunk) {
  if (!chunk || typeof chunk !== "object") return "";
  const choice = chunk.choices?.[0];
  const delta = choice?.delta || {};
  const pieces = [delta.content, choice?.message?.content, chunk.output_text, chunk.text]
    .map(textValue)
    .filter(Boolean);
  return pieces[0] || "";
}

async function fileToDataUrl(file) {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function cloneSession(session) {
  return {
    ...session,
    messages: Array.isArray(session.messages) ? session.messages.map((message) => ({ ...message })) : [],
  };
}

function getProviderLabel(connection) {
  return connection?.name || humanize(connection?.provider || connection?.id || "provider");
}

function normalizeStaticModel(model, connection) {
  if (!model?.id) return null;
  return {
    id: `${connection.provider}/${model.id}`,
    requestModel: `${connection.provider}/${model.id}`,
    name: model.name || model.id,
    providerId: connection.provider,
    providerName: getProviderLabel(connection),
    source: "static",
  };
}

function normalizeLiveModel(model, connection) {
  const rawId = typeof model === "string" ? model : model?.id || model?.name || model?.model || "";
  if (!rawId) return null;

  const displayName = typeof model === "string" ? model : model?.name || model?.displayName || rawId;

  let requestModel = rawId;
  const isCompatible =
    isOpenAICompatibleProvider(connection.provider) ||
    isAnthropicCompatibleProvider(connection.provider);
  if (isCompatible && !rawId.includes("/")) {
    requestModel = `${connection.provider}/${rawId}`;
  }

  return {
    id: requestModel,
    requestModel,
    name: displayName,
    providerId: connection.provider,
    providerName: getProviderLabel(connection),
    source: "live",
  };
}

function parseProviderModelsPayload(data) {
  if (Array.isArray(data?.models)) return data.models;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data)) return data;
  return [];
}

const STARTER_PROMPTS = [
  {
    icon: Zap,
    title: "Check Latency & Stream",
    prompt: "Respond with a fast greeting and explain your architecture and model specs in 2 sentences.",
  },
  {
    icon: Code2,
    title: "TypeScript API Client",
    prompt: "Generate a clean TypeScript fetch helper to call PALU Router's /v1/chat/completions endpoint.",
  },
  {
    icon: Terminal,
    title: "cURL Test Command",
    prompt: "Show me a complete cURL command with JSON payload to test streaming completions on this model.",
  },
  {
    icon: ShieldAlert,
    title: "Failover & Fallback Logic",
    prompt: "How does 3-tier combo routing and rate-limit fallback work in PALU Router gateway?",
  },
];

export default function BasicChatPageClient() {
  const [hasMounted, setHasMounted] = useState(false);
  const [providerGroups, setProviderGroups] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState("");
  const [activeProviderId, setActiveProviderId] = useState("");
  const [activeModelId, setActiveModelId] = useState("");
  const [chatMode, setChatMode] = useState("single"); // "single" | "arena"
  const [arenaModelAId, setArenaModelAId] = useState("");
  const [arenaModelBId, setArenaModelBId] = useState("");
  const [pickingTarget, setPickingTarget] = useState("single"); // "single" | "arenaA" | "arenaB"
  const [cacheStats, setCacheStats] = useState({ entries: 0, hits: 0, estimatedSavedTokens: 0 });
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [modelSearch, setModelSearch] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const accumulatedRef = useRef("");

  const modelMenuRef = useRef(null);
  const historyMenuRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const abortRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    setHasMounted(true);
    try {
      const saved = safeParse(globalThis.localStorage?.getItem(STORAGE_KEYS.sessions), []);
      if (Array.isArray(saved) && saved.length > 0) {
        setSessions(
          saved.map((session) => ({
            ...session,
            messages: Array.isArray(session.messages) ? session.messages : [],
          }))
        );
      }
      const savedActiveSessionId = globalThis.localStorage?.getItem(STORAGE_KEYS.activeSessionId);
      if (savedActiveSessionId) setActiveSessionId(savedActiveSessionId);

      const savedActiveProviderId = globalThis.localStorage?.getItem(STORAGE_KEYS.activeProviderId);
      if (savedActiveProviderId) setActiveProviderId(savedActiveProviderId);

      const savedChatMode = globalThis.localStorage?.getItem(STORAGE_KEYS.chatMode);
      if (savedChatMode === "arena" || savedChatMode === "single") setChatMode(savedChatMode);

      const savedArenaA = globalThis.localStorage?.getItem(STORAGE_KEYS.arenaModelAId);
      if (savedArenaA) setArenaModelAId(savedArenaA);

      const savedArenaB = globalThis.localStorage?.getItem(STORAGE_KEYS.arenaModelBId);
      if (savedArenaB) setArenaModelBId(savedArenaB);

      const savedDraft = globalThis.localStorage?.getItem(STORAGE_KEYS.draft);
      if (savedDraft) setDraft(savedDraft);
    } catch {
      // storage unavailable
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoadingData(true);
      setLoadError("");

      try {
        const [
          providersRes,
          combosRes,
          nodesRes,
          customRes,
          aliasesRes,
          disabledRes,
        ] = await Promise.all([
          fetch("/api/providers").catch(() => null),
          fetch("/api/combos").catch(() => null),
          fetch("/api/provider-nodes").catch(() => null),
          fetch("/api/models/custom").catch(() => null),
          fetch("/api/models/alias").catch(() => null),
          fetch("/api/models/disabled").catch(() => null),
        ]);

        const provData = providersRes?.ok ? await providersRes.json().catch(() => ({})) : {};
        const connections = Array.isArray(provData.connections) ? provData.connections : [];
        const combosData = combosRes?.ok ? await combosRes.json().catch(() => ({})) : {};
        const combos = Array.isArray(combosData.combos) ? combosData.combos : [];
        const nodesData = nodesRes?.ok ? await nodesRes.json().catch(() => ({})) : {};
        const nodes = Array.isArray(nodesData.nodes) ? nodesData.nodes : [];
        const customData = customRes?.ok ? await customRes.json().catch(() => ({})) : {};
        const customModels = Array.isArray(customData.models) ? customData.models : [];
        const aliasesData = aliasesRes?.ok ? await aliasesRes.json().catch(() => ({})) : {};
        const aliases = aliasesData.aliases || {};
        const disabledData = disabledRes?.ok ? await disabledRes.json().catch(() => ({})) : {};
        const disabled = disabledData || {};

        const nodeNameMap = {};
        const nodePrefixMap = {};
        for (const n of nodes) {
          if (n?.id) {
            nodeNameMap[n.id] = n.name || n.prefix || n.id;
            nodePrefixMap[n.id] = n.prefix || n.id;
          }
        }

        // Filter ONLY active provider connections
        const activeConnections = connections.filter((c) => c && c.isActive !== false);

        const groups = [];

        // 1. Combos Group (if any combos exist in UdiRouter)
        if (combos.length > 0) {
          groups.push({
            providerId: "combos",
            providerName: "Active Combos & Routers",
            models: combos.map((c) => ({
              id: `combo_${c.name}`,
              requestModel: c.name,
              name: c.name,
              providerId: "combos",
              providerName: "Active Combos & Routers",
              isCombo: true,
            })),
          });
        }

        // 2. Fetch models for each active provider connection
        const providerModelPromises = activeConnections.map(async (conn) => {
          const providerId = conn.provider;
          const providerDisplayName = conn.name || nodeNameMap[providerId] || humanize(providerId);
          const prefix = nodePrefixMap[providerId] || conn.providerSpecificData?.prefix || providerId;
          const disabledList = new Set(disabled[providerId] || disabled[prefix] || []);

          let modelList = [];

          // Try live models endpoint first for this connection
          try {
            const liveRes = await fetch(`/api/providers/${conn.id}/models`, { cache: "no-store" });
            if (liveRes.ok) {
              const liveData = await liveRes.json();
              const liveRaw = parseProviderModelsPayload(liveData);
              if (Array.isArray(liveRaw) && liveRaw.length > 0) {
                modelList = liveRaw.map((m) => {
                  const mId = typeof m === "string" ? m : m.id || m.model || m.name;
                  const mName = typeof m === "string" ? m : m.name || m.displayName || mId;
                  const requestModel = `${prefix}/${mId}`;
                  return {
                    id: `${conn.id}_${mId}`,
                    requestModel,
                    name: mName,
                    providerId,
                    providerName: providerDisplayName,
                    source: "live",
                  };
                });
              }
            }
          } catch {
            // Live fetch failed, fallback to static
          }

          // If no live models, fallback to static catalog
          if (modelList.length === 0) {
            const staticCatalog = getModelsByProviderId(providerId) || [];
            if (staticCatalog.length > 0) {
              modelList = staticCatalog.map((m) => {
                const requestModel = `${prefix}/${m.id}`;
                return {
                  id: `${conn.id}_${m.id}`,
                  requestModel,
                  name: m.name || m.id,
                  providerId,
                  providerName: providerDisplayName,
                  source: "static",
                };
              });
            }
          }

          // Also merge custom models registered under this provider
          const providerCustom = customModels.filter(
            (m) => m.providerAlias === providerId || m.providerAlias === prefix
          );
          for (const cm of providerCustom) {
            const reqModel = `${prefix}/${cm.id}`;
            if (!modelList.some((existing) => existing.requestModel === reqModel)) {
              modelList.push({
                id: `${conn.id}_${cm.id}`,
                requestModel: reqModel,
                name: cm.name || cm.id,
                providerId,
                providerName: providerDisplayName,
                source: "custom",
              });
            }
          }

          // Also merge aliases that route to this provider
          for (const [aliasName, fullModel] of Object.entries(aliases)) {
            if (fullModel.startsWith(`${providerId}/`) || fullModel.startsWith(`${prefix}/`)) {
              if (!modelList.some((m) => m.name === aliasName || m.requestModel === fullModel)) {
                modelList.push({
                  id: `${conn.id}_alias_${aliasName}`,
                  requestModel: aliasName,
                  name: aliasName,
                  providerId,
                  providerName: providerDisplayName,
                  source: "alias",
                });
              }
            }
          }

          // Filter out disabled models
          const activeModels = modelList.filter((m) => {
            const rawId = m.requestModel.includes("/") ? m.requestModel.split("/")[1] : m.requestModel;
            return !disabledList.has(rawId) && !disabledList.has(m.requestModel);
          });

          return {
            providerId: `${providerId}_${conn.id}`,
            providerName: providerDisplayName,
            models: activeModels,
          };
        });

        const resolvedProviderGroups = await Promise.all(providerModelPromises);
        for (const g of resolvedProviderGroups) {
          if (g.models.length > 0) {
            groups.push(g);
          }
        }

        if (!cancelled) {
          setProviderGroups(groups);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err?.message || "Failed to load models");
        }
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target)) {
        setModelMenuOpen(false);
      }
      if (historyMenuRef.current && !historyMenuRef.current.contains(event.target)) {
        setHistoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, streamingText]);

  const modelIndex = useMemo(() => {
    const map = new Map();
    for (const group of providerGroups) {
      for (const model of group.models) {
        map.set(model.id, model);
      }
    }
    return map;
  }, [providerGroups]);

  const activeProviderGroup = useMemo(() => {
    return providerGroups.find((g) => g.providerId === activeProviderId) || providerGroups[0] || null;
  }, [providerGroups, activeProviderId]);

  const activeModel = useMemo(() => {
    if (activeModelId && modelIndex.has(activeModelId)) return modelIndex.get(activeModelId);
    return activeProviderGroup?.models?.[0] || null;
  }, [activeModelId, modelIndex, activeProviderGroup]);

  const arenaModelA = useMemo(() => {
    if (arenaModelAId && modelIndex.has(arenaModelAId)) return modelIndex.get(arenaModelAId);
    return activeModel || providerGroups[0]?.models?.[0] || null;
  }, [arenaModelAId, modelIndex, activeModel, providerGroups]);

  const arenaModelB = useMemo(() => {
    if (arenaModelBId && modelIndex.has(arenaModelBId)) return modelIndex.get(arenaModelBId);
    const allModels = providerGroups.flatMap((g) => g.models);
    const different = allModels.find((m) => m.id !== (arenaModelA?.id || activeModel?.id));
    return different || allModels[1] || allModels[0] || null;
  }, [arenaModelBId, modelIndex, arenaModelA, activeModel, providerGroups]);

  const currentSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId) || null;
  }, [sessions, activeSessionId]);

  const currentMessages = currentSession?.messages || [];
  const canSend =
    !isSending &&
    (draft.trim().length > 0 || attachments.length > 0) &&
    (chatMode === "arena" ? (!!arenaModelA && !!arenaModelB) : !!activeModel);

  const fetchCacheStats = async () => {
    try {
      const res = await fetch("/api/dashboard/cache");
      if (res.ok) {
        const data = await res.json();
        setCacheStats(data);
      }
    } catch {}
  };

  useEffect(() => {
    if (hasMounted) {
      fetchCacheStats();
    }
  }, [hasMounted]);

  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      await fetch("/api/dashboard/cache", { method: "DELETE" });
      await fetchCacheStats();
    } catch {
    } finally {
      setIsClearingCache(false);
    }
  };

  useEffect(() => {
    if (!hasMounted) return;
    try {
      globalThis.localStorage?.setItem(STORAGE_KEYS.sessions, JSON.stringify(sessions));
      globalThis.localStorage?.setItem(STORAGE_KEYS.activeSessionId, activeSessionId);
      globalThis.localStorage?.setItem(STORAGE_KEYS.activeProviderId, activeProviderId);
      globalThis.localStorage?.setItem(STORAGE_KEYS.draft, draft);
      globalThis.localStorage?.setItem(STORAGE_KEYS.chatMode, chatMode);
      if (arenaModelAId) globalThis.localStorage?.setItem(STORAGE_KEYS.arenaModelAId, arenaModelAId);
      if (arenaModelBId) globalThis.localStorage?.setItem(STORAGE_KEYS.arenaModelBId, arenaModelBId);
    } catch {
      // storage unavailable
    }
  }, [hasMounted, sessions, activeSessionId, activeProviderId, draft, chatMode, arenaModelAId, arenaModelBId]);

  useEffect(() => {
    if (!hasMounted || loadingData || initializedRef.current) return;
    if (providerGroups.length === 0) return;

    const timer = setTimeout(() => {
      const group = providerGroups[0];
      const initialModel = group.models[0];

      if (sessions.length > 0) {
        const existing = sessions.find((s) => s.id === activeSessionId) || sessions[0];
        initializedRef.current = true;
        setActiveSessionId(existing.id);
        setActiveProviderId(existing.providerId || group.providerId);
        setActiveModelId(existing.modelId || initialModel.id);
        return;
      }

      const newSess = {
        id: createId(),
        title: "New conversation",
        providerId: group.providerId,
        providerName: group.providerName,
        modelId: initialModel.id,
        modelName: initialModel.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      };

      initializedRef.current = true;
      setSessions([newSess]);
      setActiveSessionId(newSess.id);
      setActiveProviderId(group.providerId);
      setActiveModelId(initialModel.id);
    }, 0);

    return () => clearTimeout(timer);
  }, [hasMounted, loadingData, providerGroups, sessions, activeSessionId]);

  const handleNewChat = () => {
    const isArena = chatMode === "arena";
    const baseModel = isArena ? arenaModelA : activeModel;
    if (!baseModel) return;
    const newSess = {
      id: createId(),
      title: isArena ? "Arena benchmark" : "New conversation",
      providerId: baseModel.providerId,
      providerName: baseModel.providerName,
      modelId: baseModel.id,
      modelName: baseModel.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    setSessions((prev) => [newSess, ...prev]);
    setActiveSessionId(newSess.id);
    setDraft("");
    setAttachments([]);
    setStreamingMessageId("");
    setStreamingText("");
    setHistoryOpen(false);
  };

  const handleDeleteSession = (sessionId, e) => {
    e?.stopPropagation();
    const remaining = sessions.filter((s) => s.id !== sessionId);
    setSessions(remaining);
    if (activeSessionId === sessionId) {
      if (remaining.length > 0) {
        setActiveSessionId(remaining[0].id);
      } else {
        handleNewChat();
      }
    }
  };

  const handleCopyMessage = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(""), 2000);
    } catch {}
  };

  const handleAttachFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    const images = files.filter((f) => f.type.startsWith("image/"));
    const converted = await Promise.all(
      images.map(async (f) => ({
        id: createId(),
        name: f.name,
        type: f.type,
        dataUrl: await fileToDataUrl(f),
      }))
    );
    setAttachments((prev) => [...prev, ...converted]);
    event.target.value = "";
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  const handleDeleteMessage = (messageId) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              messages: s.messages.filter((m) => m.id !== messageId),
            }
          : s
      )
    );
  };

  const handleClearCurrentChat = () => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              messages: [],
              updatedAt: new Date().toISOString(),
            }
          : s
      )
    );
  };

  const sendArenaMessage = async (userText, currentAttachments) => {
    if (!arenaModelA || !arenaModelB) return;

    let sessionId = activeSessionId;
    let session = sessions.find((s) => s.id === sessionId);
    if (!session) {
      session = {
        id: createId(),
        title: "Arena: " + makeSessionTitle(userText),
        providerId: arenaModelA.providerId,
        providerName: arenaModelA.providerName,
        modelId: arenaModelA.id,
        modelName: arenaModelA.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      };
      sessionId = session.id;
      setSessions((prev) => [session, ...prev]);
      setActiveSessionId(sessionId);
    }

    const userMessage = {
      id: createId(),
      role: "user",
      content: userText,
      attachments: (currentAttachments || []).map((a) => ({ ...a })),
      createdAt: new Date().toISOString(),
    };

    const arenaTurnId = createId();
    const arenaTurn = {
      id: arenaTurnId,
      role: "arena",
      createdAt: new Date().toISOString(),
      status: "streaming",
      modelA: {
        id: arenaModelA.id,
        name: arenaModelA.name,
        providerName: arenaModelA.providerName,
        requestModel: arenaModelA.requestModel || arenaModelA.id,
        content: "",
        status: "streaming",
        ttftMs: null,
        totalMs: null,
        cached: false,
        error: null,
      },
      modelB: {
        id: arenaModelB.id,
        name: arenaModelB.name,
        providerName: arenaModelB.providerName,
        requestModel: arenaModelB.requestModel || arenaModelB.id,
        content: "",
        status: "streaming",
        ttftMs: null,
        totalMs: null,
        cached: false,
        error: null,
      },
    };

    const nextMessages = [...(session.messages || []), userMessage, arenaTurn];

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              messages: nextMessages,
              updatedAt: new Date().toISOString(),
              title:
                s.title === "New conversation" || s.title === "Arena benchmark"
                  ? `Arena: ${makeSessionTitle(userText)}`
                  : s.title,
            }
          : s
      )
    );

    setDraft("");
    setAttachments([]);
    setIsSending(true);
    abortRef.current = new AbortController();

    const requestMessages = [
      {
        role: "user",
        content: buildUserContent(userMessage),
      },
    ];

    const runModelStream = async (targetKey, modelObj) => {
      const startTime = performance.now();
      let firstTokenReceived = false;
      let textAccumulated = "";

      try {
        const response = await fetch("/api/dashboard/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
            "x-disable-token-saver": "true",
          },
          body: JSON.stringify({
            model: modelObj.requestModel || modelObj.id,
            messages: requestMessages,
            stream: true,
          }),
          signal: abortRef.current?.signal,
        });

        const isHit = response.headers.get("x-cache") === "HIT";

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(textValue(errorData.error || errorData.message || `HTTP ${response.status}`));
        }

        const reader = response.body?.getReader();
        if (!reader) {
          const data = await response.json().catch(() => ({}));
          const fallback = textValue(
            data?.choices?.[0]?.message?.content || data?.output_text || data?.error || ""
          );
          const totalMs = Math.round(performance.now() - startTime);
          setSessions((prev) =>
            prev.map((s) =>
              s.id === sessionId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === arenaTurnId
                        ? {
                            ...m,
                            [targetKey]: {
                              ...m[targetKey],
                              content: fallback,
                              status: "done",
                              cached: isHit,
                              totalMs,
                            },
                          }
                        : m
                    ),
                  }
                : s
            )
          );
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;

            try {
              const chunk = JSON.parse(payload);
              const text = readAssistantText(chunk);
              if (!text) continue;

              let chunkTtft = null;
              if (!firstTokenReceived) {
                firstTokenReceived = true;
                chunkTtft = isHit ? 0 : Math.round(performance.now() - startTime);
              }

              textAccumulated += text;

              setSessions((prev) =>
                prev.map((s) =>
                  s.id === sessionId
                    ? {
                        ...s,
                        messages: s.messages.map((m) =>
                          m.id === arenaTurnId
                            ? {
                                ...m,
                                [targetKey]: {
                                  ...m[targetKey],
                                  content: textAccumulated,
                                  status: "streaming",
                                  cached: isHit,
                                  ttftMs: chunkTtft !== null ? chunkTtft : m[targetKey].ttftMs,
                                },
                              }
                            : m
                        ),
                      }
                    : s
                )
              );
            } catch {}
          }
        }

        const totalMs = Math.round(performance.now() - startTime);
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === arenaTurnId
                      ? {
                          ...m,
                          [targetKey]: {
                            ...m[targetKey],
                            content: textAccumulated,
                            status: "done",
                            cached: isHit,
                            totalMs,
                          },
                        }
                      : m
                  ),
                }
              : s
          )
        );
      } catch (err) {
        if (err.name !== "AbortError") {
          const errText = err.message || "Failed to complete model benchmark.";
          setSessions((prev) =>
            prev.map((s) =>
              s.id === sessionId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === arenaTurnId
                        ? {
                            ...m,
                            [targetKey]: {
                              ...m[targetKey],
                              status: "error",
                              error: errText,
                            },
                          }
                        : m
                    ),
                  }
                : s
            )
          );
        }
      }
    };

    try {
      await Promise.allSettled([
        runModelStream("modelA", arenaModelA),
        runModelStream("modelB", arenaModelB),
      ]);
    } finally {
      setIsSending(false);
      abortRef.current = null;
      fetchCacheStats();
    }
  };

  const sendMessage = async (overridePrompt) => {
    const userText = (overridePrompt || draft).trim();
    if (!userText && attachments.length === 0) return;

    if (chatMode === "arena") {
      await sendArenaMessage(userText, attachments);
      return;
    }

    const model = activeModel;
    if (!model) return;

    let sessionId = activeSessionId;
    let session = sessions.find((s) => s.id === sessionId);
    if (!session) {
      session = {
        id: createId(),
        title: "New conversation",
        providerId: model.providerId,
        providerName: model.providerName,
        modelId: model.id,
        modelName: model.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      };
      sessionId = session.id;
      setSessions((prev) => [session, ...prev]);
      setActiveSessionId(sessionId);
    }

    const userMessage = {
      id: createId(),
      role: "user",
      content: userText,
      attachments: attachments.map((a) => ({ ...a })),
      createdAt: new Date().toISOString(),
    };

    const assistantMessageId = createId();
    const assistantMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
      status: "streaming",
    };

    const nextMessages = [...(session.messages || []), userMessage, assistantMessage];

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              messages: nextMessages,
              updatedAt: new Date().toISOString(),
              title: s.title === "New conversation" ? makeSessionTitle(userText) : s.title,
            }
          : s
      )
    );

    setDraft("");
    setAttachments([]);
    setIsSending(true);
    setStreamingMessageId(assistantMessageId);
    setStreamingText("");
    abortRef.current = new AbortController();

    const requestMessages = nextMessages
      .filter((m) => !(m.role === "assistant" && m.id === assistantMessageId))
      .filter((m) => m.status !== "error" && m.content && !String(m.content).startsWith("Error:"))
      .map((m) => ({
        role: m.role,
        content: m.role === "user" ? buildUserContent(m) : m.content,
      }));

    try {
      const response = await fetch("/api/dashboard/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          "x-disable-token-saver": "true",
        },
        body: JSON.stringify({
          model: model.requestModel || model.id,
          messages: requestMessages,
          stream: true,
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(textValue(errorData.error || errorData.message || `HTTP ${response.status}`));
      }

      const reader = response.body?.getReader();
      if (!reader) {
        const data = await response.json().catch(() => ({}));
        const fallbackText = textValue(
          data?.choices?.[0]?.message?.content || data?.output_text || data?.error || data?.message || ""
        );
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantMessageId ? { ...m, content: fallbackText, status: "done" } : m
                  ),
                }
              : s
          )
        );
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";
      accumulatedRef.current = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;

          try {
            const chunk = JSON.parse(payload);
            const text = readAssistantText(chunk);
            if (!text) continue;
            accumulatedRef.current = accumulatedRef.current + text;
            const currentText = accumulatedRef.current;
            setStreamingText(currentText);
            setSessions((prev) =>
              prev.map((s) =>
                s.id === sessionId
                  ? {
                      ...s,
                      messages: s.messages.map((m) =>
                        m.id === assistantMessageId
                          ? { ...m, content: currentText, status: "streaming" }
                          : m
                      ),
                    }
                  : s
              )
            );
          } catch {}
        }
      }

      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantMessageId
                    ? { ...m, content: accumulatedRef.current || m.content, status: "done" }
                    : m
                ),
              }
            : s
        )
      );
    } catch (err) {
      if (err.name !== "AbortError") {
        const errText = err.message || "Failed to get model completion.";
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantMessageId
                      ? { ...m, content: `Error: ${errText}`, status: "error" }
                      : m
                  ),
                }
              : s
          )
        );
      }
    } finally {
      setIsSending(false);
      setStreamingMessageId("");
      setStreamingText("");
      abortRef.current = null;
      fetchCacheStats();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) sendMessage();
    }
  };

  const filteredGroups = useMemo(() => {
    if (!modelSearch.trim()) return providerGroups;
    const q = modelSearch.toLowerCase();
    return providerGroups
      .map((g) => ({
        ...g,
        models: g.models.filter(
          (m) => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.models.length > 0);
  }, [providerGroups, modelSearch]);

  return (
    <div className="flex h-full flex-col min-h-0 bg-background text-foreground">
      {/* Top Bar Header (Workbench Toolbar) */}
      <header className="shrink-0 border-b border-border bg-[#03080A]/95 backdrop-blur-md px-4 py-2.5 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 w-full">
          {/* Left: Mobile Menu, Mode Switcher & Model Selectors */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("open-sidebar"))}
              className="flex lg:hidden items-center justify-center size-8 rounded-md border border-border bg-[#080D0F] hover:bg-[#171C1E] text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="size-4" />
            </button>

            {/* Mode Switcher */}
            <div className="flex items-center rounded-md bg-[#080D0F] border border-white/10 p-0.5 text-xs shrink-0">
              <button
                type="button"
                onClick={() => setChatMode("single")}
                className={cn(
                  "px-2 py-1 rounded text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5",
                  chatMode === "single"
                    ? "bg-[#171C1E] text-primary shadow-xs border border-white/5 font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Single model testing mode"
              >
                <Bot className="size-3.5" />
                <span className="hidden sm:inline">Single</span>
              </button>
              <button
                type="button"
                onClick={() => setChatMode("arena")}
                className={cn(
                  "px-2 py-1 rounded text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5",
                  chatMode === "arena"
                    ? "bg-[#171C1E] text-amber-300 shadow-xs border border-white/5 font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Model Arena side-by-side comparison mode"
              >
                <Swords className="size-3.5" />
                <span className="hidden sm:inline">Arena</span>
                <span className="text-[9px] uppercase px-1 rounded bg-amber-400/20 text-amber-300 font-mono font-bold">VS</span>
              </button>
            </div>

            {/* Model Selector(s) */}
            {chatMode === "single" ? (
              <button
                type="button"
                onClick={() => {
                  setPickingTarget("single");
                  setModelSearch("");
                  setModelMenuOpen(true);
                }}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-md border border-white/10 bg-[#080D0F] hover:bg-[#121719] hover:border-primary/40 text-left transition-all cursor-pointer group shadow-2xs min-w-0"
              >
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-xs font-semibold text-[#FCFCFE] tracking-tight truncate max-w-[120px] sm:max-w-[200px]">
                  {activeModel ? activeModel.name : "Select Model"}
                </span>
                <span className="hidden sm:inline text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded bg-white/5 text-primary border border-primary/20 shrink-0">
                  {activeModel?.providerName || "UdiRouter"}
                </span>
                <ChevronDown className="size-3 text-muted-foreground group-hover:text-foreground transition-transform shrink-0" />
              </button>
            ) : (
              <div className="flex items-center gap-1.5 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    setPickingTarget("arenaA");
                    setModelSearch("");
                    setModelMenuOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-blue-500/30 bg-[#080D0F] hover:bg-[#121719] text-left transition-all cursor-pointer group shadow-2xs min-w-0"
                  title="Select Arena Model A"
                >
                  <span className="size-1.5 rounded-full bg-blue-400 shrink-0" />
                  <span className="text-xs font-semibold text-[#FCFCFE] tracking-tight truncate max-w-[90px] sm:max-w-[130px]">
                    {arenaModelA ? arenaModelA.name : "Model A"}
                  </span>
                  <ChevronDown className="size-3 text-muted-foreground group-hover:text-foreground shrink-0" />
                </button>

                <span className="text-[11px] font-mono font-black text-amber-400 shrink-0 px-0.5">VS</span>

                <button
                  type="button"
                  onClick={() => {
                    setPickingTarget("arenaB");
                    setModelSearch("");
                    setModelMenuOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-purple-500/30 bg-[#080D0F] hover:bg-[#121719] text-left transition-all cursor-pointer group shadow-2xs min-w-0"
                  title="Select Arena Model B"
                >
                  <span className="size-1.5 rounded-full bg-purple-400 shrink-0" />
                  <span className="text-xs font-semibold text-[#FCFCFE] tracking-tight truncate max-w-[90px] sm:max-w-[130px]">
                    {arenaModelB ? arenaModelB.name : "Model B"}
                  </span>
                  <ChevronDown className="size-3 text-muted-foreground group-hover:text-foreground shrink-0" />
                </button>
              </div>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Cache Stats Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#080D0F] border border-white/10 text-xs">
              <Zap className="size-3 text-primary shrink-0" />
              <span className="text-muted-foreground text-[11px]">Cache:</span>
              <span className="font-mono text-xs font-semibold text-[#FCFCFE]">{cacheStats?.hits || 0} hits</span>
              {cacheStats?.hits > 0 && (
                <button
                  type="button"
                  onClick={handleClearCache}
                  disabled={isClearingCache}
                  className="ml-1 text-[10px] text-muted-foreground hover:text-destructive underline cursor-pointer disabled:opacity-50"
                  title="Clear prompt cache"
                >
                  {isClearingCache ? "..." : "Reset"}
                </button>
              )}
            </div>

            {currentMessages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                icon={<Trash2 className="size-3.5" />}
                onClick={handleClearCurrentChat}
                title="Clear current messages"
              >
                Clear
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              icon={<Clock className="size-3.5" />}
              onClick={() => setHistoryOpen(true)}
            >
              History
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="size-3.5 stroke-[2.5]" />}
              onClick={handleNewChat}
            >
              New Chat
            </Button>
          </div>
        </div>
      </header>

      {/* Model Selection Centered Modal */}
      {modelMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in-0 duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setModelMenuOpen(false)}
          />
          <div className="relative z-10 w-full max-w-2xl max-h-[82vh] flex flex-col rounded-lg border border-border bg-[#080D0F] shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-border bg-[#171C1E]/50 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                    <Bot className="size-3.5" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {pickingTarget === "arenaA"
                      ? "Select Arena Model A"
                      : pickingTarget === "arenaB"
                      ? "Select Arena Model B"
                      : "Select AI Model"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setModelMenuOpen(false)}
                  className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={modelSearch}
                  onChange={(e) => setModelSearch(e.target.value)}
                  placeholder="Search active models or combos (e.g. GRATIS, Llama, DeepSeek)..."
                  className="w-full h-9 pl-9 pr-3 rounded-md bg-[#03080A] border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  autoFocus
                />
              </div>
            </div>

            {/* Model Categories List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {filteredGroups.length === 0 ? (
                <p className="text-center py-10 text-xs text-muted-foreground">
                  No matching active models found.
                </p>
              ) : (
                filteredGroups.map((group) => (
                  <div key={group.providerId} className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-semibold text-foreground tracking-wide">{group.providerName}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                        {group.models.length} models
                      </span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {group.models.map((m) => {
                        const isCur =
                          pickingTarget === "arenaA"
                            ? m.id === (arenaModelA?.id || arenaModelAId)
                            : pickingTarget === "arenaB"
                            ? m.id === (arenaModelB?.id || arenaModelBId)
                            : m.id === activeModelId;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              if (pickingTarget === "arenaA") {
                                setArenaModelAId(m.id);
                              } else if (pickingTarget === "arenaB") {
                                setArenaModelBId(m.id);
                              } else {
                                setActiveProviderId(m.providerId);
                                setActiveModelId(m.id);
                              }
                              setModelMenuOpen(false);
                            }}
                            className={cn(
                              "flex items-start justify-between gap-3 p-3 rounded-md border text-left transition-all cursor-pointer",
                              isCur
                                ? "border-primary bg-primary/10 text-primary shadow-xs"
                                : "border-border/60 bg-[#171C1E]/40 hover:bg-[#171C1E] hover:border-border text-foreground"
                            )}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold truncate text-[#FCFCFE]">{m.name}</p>
                              <p className="text-[10px] text-muted-foreground truncate font-mono mt-0.5">{m.requestModel}</p>
                            </div>
                            {isCur ? (
                              <Check className="size-4 text-primary shrink-0 mt-0.5" />
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground shrink-0 border border-border/40 uppercase">
                                {m.source || "model"}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* History Centered Modal */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in-0 duration-150">
          <div className="fixed inset-0" onClick={() => setHistoryOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-lg border border-border bg-[#080D0F] shadow-2xl p-4 overflow-hidden space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Chat History</span>
              </div>
              <button
                type="button"
                onClick={() => setHistoryOpen(false)}
                className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto space-y-1 p-0.5 custom-scrollbar">
              {sessions.length === 0 ? (
                <p className="text-center py-6 text-xs text-muted-foreground">No chats saved yet</p>
              ) : (
                sessions.map((s) => {
                  const isCur = s.id === activeSessionId;
                  return (
                    <div
                      key={s.id}
                      onClick={() => {
                        setActiveSessionId(s.id);
                        setActiveProviderId(s.providerId || activeProviderId);
                        setActiveModelId(s.modelId || activeModelId);
                        setHistoryOpen(false);
                      }}
                      className={cn(
                        "group flex items-center justify-between gap-2 px-3 py-2 rounded-md text-left transition-colors cursor-pointer text-xs",
                        isCur
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-[#171C1E] text-foreground"
                      )}
                    >
                      <span className="truncate flex-1 font-medium">{s.title || "Untitled Chat"}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0 group-hover:hidden">
                        {formatRelativeTime(s.updatedAt)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSession(s.id, e)}
                        className="hidden group-hover:flex items-center text-muted-foreground hover:text-destructive p-1 rounded cursor-pointer"
                        title="Delete session"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Conversation Stream Area (Centered Column) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
          {currentMessages.length === 0 ? (
            /* Empty State: AI Model Testing Onboarding */
            <div className="py-12 sm:py-16 text-center space-y-8 animate-in fade-in-0 duration-300">
              <div className="mx-auto flex size-12 items-center justify-center rounded-md bg-primary/10 text-primary border border-primary/20">
                <Bot className="size-6" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#FCFCFE]">
                  Model Playground
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Send prompts, benchmark latency, and test streaming completions across your active AI models and combos.
                </p>
              </div>

              {providerGroups.length === 0 && !loadingData && (
                <div className="p-4 rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-xl mx-auto text-left">
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert className="size-5 shrink-0 text-amber-500" />
                    <p className="leading-relaxed font-medium">
                      Belum ada AI provider yang aktif. Silakan tambahkan API key atau aktifkan koneksi provider untuk mulai testing.
                    </p>
                  </div>
                  <Link
                    href="/dashboard/providers"
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-semibold text-xs shrink-0 hover:opacity-90 transition-opacity"
                  >
                    Atur Provider →
                  </Link>
                </div>
              )}

              {/* Starter Prompts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-xl mx-auto pt-2">
                {STARTER_PROMPTS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => sendMessage(item.prompt)}
                      className="group flex flex-col justify-between p-3.5 rounded-md border border-border bg-[#080D0F] hover:bg-[#171C1E] hover:border-primary/40 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-[#171C1E] text-primary">
                            <Icon className="size-3.5" />
                          </div>
                          <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                            {item.title}
                          </span>
                        </div>
                        <ArrowUpRight className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">
                        {item.prompt}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Active Messages List */
            currentMessages.map((m) => {
              const isUser = m.role === "user";
              const isStreaming = m.role === "assistant" && m.id === streamingMessageId && m.status === "streaming";
              const content = m.content || (m.role === "assistant" ? streamingText : "");
              const isError = !isUser && (m.status === "error" || String(content).startsWith("Error:"));

              if (isError) {
                return (
                  <div
                    key={m.id}
                    className="w-full my-2 p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center justify-between gap-3 animate-in fade-in-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertTriangle className="size-4 shrink-0 text-destructive" />
                      <span className="font-mono text-xs truncate">{content}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteMessage(m.id)}
                      className="text-xs px-2.5 py-1 rounded-md bg-destructive/20 hover:bg-destructive/30 text-destructive font-medium cursor-pointer shrink-0 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                );
              }

              if (isUser) {
                return (
                  <div key={m.id} className="flex flex-col items-end w-full group py-1.5 animate-in fade-in-0 duration-200">
                    <div className="flex items-center gap-2 mb-1 mr-1 text-xs text-muted-foreground">
                      <span className="font-semibold text-xs text-[#FCFCFE] flex items-center gap-1.5">
                        <User className="size-3 text-primary" /> You
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {formatRelativeTime(m.createdAt)}
                      </span>
                    </div>

                    <div className="max-w-[88%] sm:max-w-[75%] rounded-lg bg-[#14191C] border border-white/10 px-4 py-3 text-sm text-[#FCFCFE] shadow-xs">
                      {/* Image Attachments */}
                      {m.attachments?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {m.attachments.map((att) => (
                            <img
                              key={att.id}
                              src={att.dataUrl}
                              alt={att.name}
                              className="size-20 rounded-md object-cover border border-white/10"
                            />
                          ))}
                        </div>
                      )}
                      <div className="whitespace-pre-wrap break-words leading-relaxed">{content}</div>
                    </div>

                    <div className="flex items-center gap-2 mt-1 mr-1 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(content, m.id)}
                        className="hover:text-foreground cursor-pointer flex items-center gap-1"
                        title="Copy message"
                      >
                        {copiedId === m.id ? <Check className="size-3 text-primary" /> : <Copy className="size-3" />}
                        <span>{copiedId === m.id ? "Copied" : "Copy"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(m.id)}
                        className="hover:text-destructive cursor-pointer flex items-center gap-1"
                        title="Delete turn"
                      >
                        <Trash2 className="size-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              }

              if (m.role === "arena") {
                const modelA = m.modelA || {};
                const modelB = m.modelB || {};
                const isDoneA = modelA.status === "done";
                const isDoneB = modelB.status === "done";
                const bothDone = isDoneA && isDoneB;

                let winner = null;
                if (bothDone && modelA.ttftMs != null && modelB.ttftMs != null && !modelA.error && !modelB.error) {
                  if (modelA.ttftMs < modelB.ttftMs) {
                    winner = { side: "A", diffMs: modelB.ttftMs - modelA.ttftMs, name: modelA.name };
                  } else if (modelB.ttftMs < modelA.ttftMs) {
                    winner = { side: "B", diffMs: modelA.ttftMs - modelB.ttftMs, name: modelB.name };
                  } else {
                    winner = { tie: true };
                  }
                }

                return (
                  <div key={m.id} className="w-full my-3 space-y-2.5 animate-in fade-in-0 duration-200">
                    {/* Arena Header */}
                    <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="size-5 rounded bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold text-[10px]">
                          VS
                        </div>
                        <span className="font-semibold text-[#FCFCFE] text-xs">Model Arena Benchmark</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{formatRelativeTime(m.createdAt)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {winner && !winner.tie && (
                          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-[11px] font-medium text-primary">
                            <Trophy className="size-3" />
                            <span>
                              <strong>{winner.name}</strong> was {winner.diffMs}ms faster to first token
                            </span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(m.id)}
                          className="p-1 text-muted-foreground hover:text-destructive hover:bg-white/5 rounded cursor-pointer transition-colors"
                          title="Delete arena turn"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </div>

                    {/* Side-by-side Dual Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Model A Card */}
                      <div
                        className={cn(
                          "flex flex-col rounded-lg border bg-[#080D0F] shadow-xs overflow-hidden transition-all",
                          winner?.side === "A" ? "border-primary/50 shadow-primary/5" : "border-white/10"
                        )}
                      >
                        {/* Header A */}
                        <div className="p-3 border-b border-white/5 bg-[#121719] flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="size-2 rounded-full bg-blue-400 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#FCFCFE] truncate">{modelA.name || "Model A"}</p>
                              <p className="text-[10px] text-muted-foreground font-mono truncate">{modelA.providerName || "UdiRouter"}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {modelA.cached && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/30 font-semibold flex items-center gap-1">
                                <Zap className="size-3" /> CACHED 0ms
                              </span>
                            )}
                            {modelA.ttftMs != null && !modelA.cached && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-muted-foreground flex items-center gap-1">
                                <Timer className="size-3 text-muted-foreground" /> {modelA.ttftMs}ms TTFT
                              </span>
                            )}
                            {modelA.totalMs != null && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-muted-foreground">
                                {(modelA.totalMs / 1000).toFixed(1)}s
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleCopyMessage(modelA.content, `${m.id}_a`)}
                              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-white/5 cursor-pointer transition-colors"
                              title="Copy response"
                            >
                              {copiedId === `${m.id}_a` ? <Check className="size-3 text-primary" /> : <Copy className="size-3" />}
                            </button>
                          </div>
                        </div>

                        {/* Body A */}
                        <div className="p-4 flex-1 text-xs sm:text-sm">
                          {modelA.error ? (
                            <div className="text-destructive text-xs p-2.5 rounded bg-destructive/10 border border-destructive/20 font-mono">
                              {modelA.error}
                            </div>
                          ) : modelA.content ? (
                            <MarkdownContent content={modelA.content} />
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
                              <span className="size-2 rounded-full bg-primary animate-pulse" />
                              <span>Waiting for {modelA.name || "Model A"} stream...</span>
                            </div>
                          )}
                          {modelA.status === "streaming" && modelA.content && (
                            <span className="inline-block mt-2 size-2 rounded-full bg-primary animate-pulse" />
                          )}
                        </div>
                      </div>

                      {/* Model B Card */}
                      <div
                        className={cn(
                          "flex flex-col rounded-lg border bg-[#080D0F] shadow-xs overflow-hidden transition-all",
                          winner?.side === "B" ? "border-primary/50 shadow-primary/5" : "border-white/10"
                        )}
                      >
                        {/* Header B */}
                        <div className="p-3 border-b border-white/5 bg-[#121719] flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="size-2 rounded-full bg-purple-400 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#FCFCFE] truncate">{modelB.name || "Model B"}</p>
                              <p className="text-[10px] text-muted-foreground font-mono truncate">{modelB.providerName || "UdiRouter"}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {modelB.cached && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/30 font-semibold flex items-center gap-1">
                                <Zap className="size-3" /> CACHED 0ms
                              </span>
                            )}
                            {modelB.ttftMs != null && !modelB.cached && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-muted-foreground flex items-center gap-1">
                                <Timer className="size-3 text-muted-foreground" /> {modelB.ttftMs}ms TTFT
                              </span>
                            )}
                            {modelB.totalMs != null && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-muted-foreground">
                                {(modelB.totalMs / 1000).toFixed(1)}s
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleCopyMessage(modelB.content, `${m.id}_b`)}
                              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-white/5 cursor-pointer transition-colors"
                              title="Copy response"
                            >
                              {copiedId === `${m.id}_b` ? <Check className="size-3 text-primary" /> : <Copy className="size-3" />}
                            </button>
                          </div>
                        </div>

                        {/* Body B */}
                        <div className="p-4 flex-1 text-xs sm:text-sm">
                          {modelB.error ? (
                            <div className="text-destructive text-xs p-2.5 rounded bg-destructive/10 border border-destructive/20 font-mono">
                              {modelB.error}
                            </div>
                          ) : modelB.content ? (
                            <MarkdownContent content={modelB.content} />
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
                              <span className="size-2 rounded-full bg-primary animate-pulse" />
                              <span>Waiting for {modelB.name || "Model B"} stream...</span>
                            </div>
                          )}
                          {modelB.status === "streaming" && modelB.content && (
                            <span className="inline-block mt-2 size-2 rounded-full bg-primary animate-pulse" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // Assistant Message
              return (
                <div key={m.id} className="flex flex-col w-full group py-2 animate-in fade-in-0 duration-200">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5 px-0.5">
                    <div className="flex items-center gap-2">
                      <div className="size-5 rounded bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0 text-primary">
                        <Bot className="size-3" />
                      </div>
                      <span className="font-semibold text-xs text-[#FCFCFE]">
                        {activeModel?.name || "Assistant"}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-muted-foreground">
                        {activeModel?.providerName || "UdiRouter"}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {formatRelativeTime(m.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(content, m.id)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-muted-foreground hover:text-foreground hover:bg-white/5 cursor-pointer transition-colors"
                        title="Copy message"
                      >
                        {copiedId === m.id ? <Check className="size-3 text-primary" /> : <Copy className="size-3" />}
                        <span>{copiedId === m.id ? "Copied" : "Copy"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(m.id)}
                        className="p-1 text-muted-foreground hover:text-destructive hover:bg-white/5 rounded cursor-pointer transition-colors"
                        title="Delete turn"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </div>

                  <div className="rounded-lg bg-[#080D0F] border border-white/10 p-4 sm:p-5 shadow-xs">
                    <MarkdownContent content={content} />
                    {isStreaming && (
                      <span className="inline-block mt-2 size-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Composer Area (Aligned with chat column) */}
      <div className="shrink-0 border-t border-border bg-[#03080A]/95 backdrop-blur-md px-4 py-3">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-1">
              {attachments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted border border-border text-xs text-foreground"
                >
                  <span className="truncate max-w-[140px]">{a.name}</span>
                  <button
                    type="button"
                    onClick={() => setAttachments((prev) => prev.filter((item) => item.id !== a.id))}
                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Textarea Composer Container */}
          <div className="relative rounded-md border border-border bg-[#080D0F] focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                chatMode === "arena"
                  ? arenaModelA && arenaModelB
                    ? `Compare ${arenaModelA.name} vs ${arenaModelB.name}... (Enter to send)`
                    : "Select two models to compare..."
                  : activeModel
                  ? `Message ${activeModel.name}... (Enter to send, Shift+Enter for new line)`
                  : "Select a model to begin testing..."
              }
              rows={2}
              className="w-full resize-none bg-transparent px-3.5 pt-3 pb-10 text-xs sm:text-sm text-[#FCFCFE] outline-none placeholder:text-muted-foreground max-h-40 overflow-y-auto custom-scrollbar"
            />

            {/* Bottom Actions Bar inside Composer */}
            <div className="absolute left-2.5 right-2.5 bottom-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors cursor-pointer"
                  title="Attach image"
                >
                  <Paperclip className="size-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleAttachFiles}
                />
                <span className="text-[11px] text-muted-foreground hidden sm:inline font-mono">
                  {chatMode === "arena"
                    ? `${arenaModelA?.name || "Model A"} vs ${arenaModelB?.name || "Model B"}`
                    : activeModel
                    ? activeModel.name
                    : "No model"}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {isSending ? (
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<Square className="size-3.5" />}
                    onClick={handleStop}
                  >
                    Stop
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!canSend}
                    icon={<Send className="size-3.5 stroke-[2.5]" />}
                    onClick={() => sendMessage()}
                  >
                    Send
                  </Button>
                )}
              </div>
            </div>
          </div>

          <p className="text-center text-[10px] text-muted-foreground/70">
            Messages are routed directly through UdiRouter Gateway to upstream provider APIs.
          </p>
        </div>
      </div>
    </div>
  );
}
