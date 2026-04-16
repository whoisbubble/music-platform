"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WandSparkles } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import type { AuthResponse } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await apiFetch<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      });

      login(response);
      router.push("/");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Не удалось создать аккаунт");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10 md:px-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.03))] shadow-[0_24px_70px_rgba(3,3,12,.45)] lg:grid-cols-[1.05fr_.95fr]">
        <section className="hidden border-r border-white/8 bg-[radial-gradient(circle_at_top,rgba(168,85,247,.33),transparent_42%),linear-gradient(180deg,#14091f,#0b0611)] p-10 lg:block">
          <div className="mb-10 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-violet-100/72">
            <WandSparkles className="h-4 w-4" />
            Новый аккаунт
          </div>
          <h1 className="max-w-md text-5xl font-bold leading-tight text-white">
            Соберите собственную музыкальную витрину в BOSTONCOLLECT.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-violet-100/68">
            После регистрации создаётся личная коллекция, а роль пользователя хранится на сервере и
            используется для доступа к админке.
          </p>
        </section>

        <section className="p-8 md:p-10">
          <div className="mb-8">
            <div className="mb-3 text-xs uppercase tracking-[0.32em] text-violet-200/55">create account</div>
            <h1 className="text-3xl font-bold text-white">Регистрация</h1>
            <p className="mt-2 text-sm text-violet-100/62">Создайте профиль и начните собирать коллекцию.</p>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-violet-100/65">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="bostonlistener"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-violet-100/32 focus:border-violet-300/45 focus:ring-4 focus:ring-violet-500/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-violet-100/65">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-violet-100/32 focus:border-violet-300/45 focus:ring-4 focus:ring-violet-500/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-violet-100/65">Пароль</label>
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Минимум 6 символов"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-violet-100/32 focus:border-violet-300/45 focus:ring-4 focus:ring-violet-500/10"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-[linear-gradient(135deg,#a855f7,#7c3aed)] px-4 py-3.5 text-sm font-bold text-white shadow-[0_18px_40px_rgba(124,58,237,.32)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Создаём..." : "Создать аккаунт"}
            </button>
          </form>

          <p className="mt-6 text-sm text-violet-100/55">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="font-semibold text-white transition hover:text-violet-200">
              Войти
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
