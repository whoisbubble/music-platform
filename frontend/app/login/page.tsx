"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import type { AuthResponse } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      login(response);
      router.push("/");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Не удалось войти");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden border-r border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,.38),transparent_38%),linear-gradient(160deg,#12091e,#090510)] p-10 lg:flex lg:flex-col">
        <div className="mb-14 flex items-center gap-3">
          <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-violet-500 text-white shadow-[0_18px_40px_rgba(124,58,237,.35)]">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-violet-200/55">welcome back</div>
            <div className="text-2xl font-bold tracking-[0.08em] text-white">BOSTONCOLLECT</div>
          </div>
        </div>

        <div className="mt-auto max-w-xl">
          <h1 className="mb-5 text-5xl font-bold leading-tight text-white">
            Музыкальная платформа с коллекцией, альбомами и живым общим чатом.
          </h1>
          <p className="max-w-lg text-base leading-7 text-violet-100/70">
            Вход открывает весь каталог, личную коллекцию и админский раздел для пользователей с ролью
            администратора.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10 md:px-8">
        <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/6 p-8 shadow-[0_20px_60px_rgba(5,5,15,.45)] backdrop-blur-xl">
          <div className="mb-8">
            <div className="mb-3 text-xs uppercase tracking-[0.32em] text-violet-200/55">sign in</div>
            <h1 className="text-3xl font-bold text-white">С возвращением</h1>
            <p className="mt-2 text-sm text-violet-100/62">Войдите, чтобы открыть BOSTONCOLLECT.</p>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Введите пароль"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-violet-100/32 focus:border-violet-300/45 focus:ring-4 focus:ring-violet-500/10"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-[linear-gradient(135deg,#a855f7,#7c3aed)] px-4 py-3.5 text-sm font-bold text-white shadow-[0_18px_40px_rgba(124,58,237,.32)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Входим..." : "Войти"}
            </button>
          </form>

          <p className="mt-6 text-sm text-violet-100/55">
            Нет аккаунта?{" "}
            <Link href="/register" className="font-semibold text-white transition hover:text-violet-200">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
