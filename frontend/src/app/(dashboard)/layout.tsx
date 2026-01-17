"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import type { Route } from "next";
import {
  Brain,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  ChevronRight,
  Bell,
  Search,
  Crosshair,
  Newspaper,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const t = useTranslations();
  const locale = useLocale();

  // Full-screen pages without sidebar
  const isFullScreenPage = pathname === "/onboarding" || pathname === "/war-room";

  // Simplified navigation - War Room is the primary feature
  // All AI Assistant, Analytics, and Dashboard features are consolidated in War Room
  const navigation = [
    { name: t("nav.warRoom") || "War Room", href: "/war-room" as Route, icon: Crosshair },
    { name: t("nav.articles") || "文章", href: "/articles" as Route, icon: Newspaper },
    { name: t("nav.settings"), href: "/settings" as Route, icon: Settings },
  ];

  // Full-screen layout for onboarding and war-room
  if (isFullScreenPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900/50 backdrop-blur-xl border-r border-white/5 transition-all duration-300 ease-in-out lg:static",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          sidebarCollapsed ? "lg:w-20" : "lg:w-64",
          "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/5">
          <Link href={"/war-room" as Route} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-cyan to-accent-blue shrink-0">
              <Brain className="h-5 w-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-xl font-bold text-white">{t("common.appName")}</span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-accent-cyan/20 to-accent-blue/10 text-white border border-accent-cyan/20"
                    : "text-white/60 hover:bg-white/5 hover:text-white",
                  sidebarCollapsed && "lg:justify-center lg:px-2"
                )}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-accent-cyan")} />
                {!sidebarCollapsed && <span>{item.name}</span>}
                {!sidebarCollapsed && isActive && (
                  <ChevronRight className="h-4 w-4 ml-auto text-accent-cyan" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse button (Desktop only) */}
        <div className="hidden lg:block px-4 py-2 border-t border-white/5">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm text-white/40 hover:bg-white/5 hover:text-white transition-colors"
          >
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform duration-300",
                sidebarCollapsed ? "rotate-0" : "rotate-180"
              )}
            />
            {!sidebarCollapsed && <span>{t("nav.collapse")}</span>}
          </button>
        </div>

        {/* User section */}
        <div className="border-t border-white/5 p-4">
          <div className={cn(
            "flex items-center gap-3",
            sidebarCollapsed && "lg:justify-center"
          )}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-indigo/20 to-accent-purple/20 border border-white/10 shrink-0">
              <User className="h-5 w-5 text-white/70" />
            </div>
            {!sidebarCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    Demo User
                  </p>
                  <p className="text-xs text-white/40 truncate">demo@sts.com</p>
                </div>
                <button
                  onClick={() => {
                    // TODO: Implement logout
                    console.log("Logout");
                  }}
                  className="rounded-lg p-2 text-white/40 hover:bg-white/5 hover:text-white transition-colors"
                  title={t("common.signOut")}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex h-16 items-center justify-between gap-4 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl px-4 lg:px-6">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-white/60 hover:bg-white/5 hover:text-white lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="text"
                placeholder={t("common.search")}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/40 focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/30 transition-all"
              />
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <LanguageSwitcher currentLocale={locale} />

            {/* Notifications */}
            <button
              className="relative rounded-xl p-2 text-white/60 hover:bg-white/5 hover:text-white transition-colors"
              title={t("common.notifications")}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-cyan rounded-full" />
            </button>

            {/* Mobile Logo */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-cyan to-accent-blue">
                <Brain className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
