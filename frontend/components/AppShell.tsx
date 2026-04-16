"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Album, Home, MessageCircle, Search, Shield, Sparkles } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useAuthStore } from "@/store/useAuthStore";
import { useCollectionStore } from "@/store/useCollectionStore";

interface AppShellProps {
  children: React.ReactNode;
}

const AUTH_PAGES = ["/login", "/register"];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { user, checkAuth } = useAuthStore();
  const { refresh, reset } = useCollectionStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
      void refresh();
      return;
    }

    reset();
  }, [refresh, reset, user]);

  if (AUTH_PAGES.includes(pathname)) {
    return <>{children}</>;
  }

  const mobileNavItems = [
    { href: "/", label: "Главная", icon: Home },
    { href: "/search", label: "Поиск", icon: Search },
    { href: "/collection", label: "Коллекция", icon: Album },
    { href: "/chat", label: "Чат", icon: MessageCircle },
  ];

  if (user?.isAdmin) {
    mobileNavItems.push({ href: "/admin", label: "Админка", icon: Shield });
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">
        <div className="min-h-screen bg-[linear-gradient(180deg,#0b0612,#08050d)]">
          <div className="mx-auto min-h-screen w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8">
            <header className="mb-6 rounded-[1.4rem] border border-white/10 bg-white/6 p-4 xl:hidden">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-500 text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-[0.22em] text-violet-200/55">music hub</div>
                  <div className="truncate text-lg font-bold tracking-[0.04em] text-white">BOSTONCOLLECT</div>
                </div>
              </div>

              <nav className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {mobileNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex min-w-0 items-center gap-2 rounded-2xl px-3 py-3 text-sm font-medium transition ${
                        isActive
                          ? "border border-violet-300/20 bg-violet-500/20 text-white"
                          : "border border-white/8 bg-black/15 text-violet-100/70"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </header>

            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
