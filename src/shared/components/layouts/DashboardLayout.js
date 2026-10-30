"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X
} from "lucide-react";
import { useNotificationStore } from "@/store/notificationStore";
import Sidebar from "../Sidebar";
import Header from "../Header";

function getToastStyle(type) {
  if (type === "success") {
    return {
      wrapper: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      icon: CheckCircle2,
    };
  }
  if (type === "error") {
    return {
      wrapper: "border-destructive/30 bg-destructive/10 text-destructive dark:text-destructive",
      icon: AlertCircle,
    };
  }
  if (type === "warning") {
    return {
      wrapper: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
      icon: AlertTriangle,
    };
  }
  return {
    wrapper: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    icon: Info,
  };
}

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const notifications = useNotificationStore((state) => state.notifications);
  const removeNotification = useNotificationStore((state) => state.removeNotification);

  // Preload heavy usage charts in background when browser is idle
  useEffect(() => {
    const preload = () => {
      import("@/shared/components/UsageStats").catch(() => {});
      import("@/app/(dashboard)/dashboard/usage/components/UsageChart").catch(() => {});
      import("@/app/(dashboard)/dashboard/usage/components/ProviderBarChart").catch(() => {});
      import("@/app/(dashboard)/dashboard/usage/components/TopModelsChart").catch(() => {});
    };
    if (typeof window !== "undefined") {
      if ("requestIdleCallback" in window) {
        const id = window.requestIdleCallback(preload, { timeout: 4000 });
        return () => window.cancelIdleCallback(id);
      }
      const timer = setTimeout(preload, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const isChat = pathname === "/dashboard/chat" || pathname === "/dashboard/basic-chat";

  useEffect(() => {
    const handleOpenSidebar = () => setSidebarOpen(true);
    window.addEventListener("open-sidebar", handleOpenSidebar);
    return () => window.removeEventListener("open-sidebar", handleOpenSidebar);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground transition-colors">
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-[80] flex w-[min(92vw,380px)] flex-col gap-2">
        {notifications.map((n) => {
          const style = getToastStyle(n.type);
          const IconComponent = style.icon;
          return (
            <div
              key={n.id}
              className={`rounded-xl border px-3.5 py-2.5 shadow-lg backdrop-blur-md transition-all ${style.wrapper}`}
            >
              <div className="flex items-start gap-2.5">
                <IconComponent className="size-4 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  {n.title ? (
                    <p className="text-xs font-semibold mb-0.5">{n.title}</p>
                  ) : null}
                  <p className="text-xs whitespace-pre-wrap break-words opacity-90">
                    {n.message}
                  </p>
                </div>
                {n.dismissible ? (
                  <button
                    type="button"
                    onClick={() => removeNotification(n.id)}
                    className="text-current/60 hover:text-current p-0.5 rounded cursor-pointer"
                    aria-label="Dismiss notification"
                  >
                    <X className="size-3.5" />
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden animate-in fade-in-0 duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar />
      </div>

      {/* Sidebar - Mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform lg:hidden transition-transform duration-300 ease-in-out shadow-2xl ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <main className="flex flex-col flex-1 h-full min-w-0 relative isolate">
        {!isChat && <Header key={pathname} onMenuClick={() => setSidebarOpen(true)} />}
        <div
          className={`flex-1 min-h-0 ${
            isChat
              ? "flex flex-col overflow-hidden h-full"
              : "overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8"
          }`}
        >
          <div
            className={
              isChat
                ? "flex-1 w-full h-full flex flex-col min-h-0"
                : "max-w-7xl mx-auto"
            }
          >
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
