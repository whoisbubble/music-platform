"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Album,
  Home,
  LogIn,
  LogOut,
  MessageCircle,
  Search,
  Shield,
  Sparkles,
  User,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export function Sidebar() {
  const pathname = usePathname();
  const { user, checkAuth, logout } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const navItems = [
    { href: "/", icon: Home, label: "Главная" },
    { href: "/search", icon: Search, label: "Поиск" },
    { href: "/collection", icon: Album, label: "Коллекция" },
    { href: "/chat", icon: MessageCircle, label: "Общий чат" },
  ];

  if (user?.isAdmin) {
    navItems.push({ href: "/admin", icon: Shield, label: "Админка" });
  }

  return (
    <aside className="hidden w-72 shrink-0 border-r border-white/8 bg-[#0b0612] p-5 xl:flex xl:flex-col">
      <Link href="/" className="mb-8 flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-500 text-white">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-[0.2em] text-violet-200/50">music hub</div>
          <div className="truncate text-lg font-bold tracking-[0.04em] text-white">BOSTONCOLLECT</div>
        </div>
      </Link>

      <nav className="space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-violet-500/18 text-white"
                  : "text-violet-100/65 hover:bg-white/6 hover:text-white"
              }`}
            >
              <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-violet-200" : "text-violet-300/65"}`} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-xs uppercase tracking-[0.2em] text-violet-200/50">каталог</div>
        <p className="mt-2 text-sm leading-6 text-violet-100/62">
          Реальные альбомы, треки и ссылки на прослушивание.
        </p>
      </div>

      <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
        {user ? (
          <>
            <div className="mb-4 flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-500/18 text-violet-100">
                <User className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-white">{user.username}</div>
                <div className="truncate text-xs text-violet-200/55">{user.email}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-white transition hover:border-red-300/20 hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              Выйти
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-white transition hover:border-violet-300/25 hover:bg-violet-500/10"
          >
            <LogIn className="h-4 w-4" />
            Войти
          </Link>
        )}
      </div>
    </aside>
  );
}
